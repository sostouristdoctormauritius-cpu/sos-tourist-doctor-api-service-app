const { status } = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const ApiError = require('../utils/ApiError');
const dbManager = require('../db/dbManager');
const config = require('../config/config');
const logger = require('../config/logger');
const { isValidEmail } = require('../utils/validation');
const { tokenTypes } = require('../config/tokens');
const moment = require('../config/timezone');
const { createClient } = require('@supabase/supabase-js');

// Get Supabase client for Auth operations when needed
const getSupabaseClient = () => {
  // Create a new Supabase client specifically for authentication operations
  // This uses the anon key which is appropriate for user authentication
  const supabase = createClient(config.supabase.url, config.supabase.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    global: {
      headers: {
        'X-Client-Info': 'sos-tourist-doctor-api-auth'
      }
    }
  });

  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  return supabase;
};

const supabase = getSupabaseClient();

const register = catchAsync(async (req, res) => {
  const { email, password, name, phone, role } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone,
        role: role || 'user'
      }
    }
  });

  if (error) {
    throw new ApiError(status.BAD_REQUEST, error.message);
  }

  if (!data.user) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, 'User registration failed');
  }

  // Handle file upload
  let profilePicture = null;
  if (req.file) {
    profilePicture = req.file.location || `${req.protocol}://${req.get('host')}/public/${req.file.filename}`;
  }

  // Create user in local database
  const userPayload = {
    id: data.user.id,
    email: data.user.email,
    name,
    phone,
    role: data.user.user_metadata.role,
    profile_picture: profilePicture,
    is_email_verified: data.user.email_confirmed_at ? true : false
  };

  const user = await userService.createUser(userPayload);

  res.status(status.CREATED).send({ user, session: data.session });
});

const authenticateUser = async (email, password, requiredRole = null) => {
  const supabase = getSupabaseClient();

  logger.info('Attempting Supabase authentication', { email });

  // Use Supabase's native sign in method with email/password
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    logger.error('Supabase authentication failed', { email, error: error.message, code: error.code });
    throw new ApiError(status.UNAUTHORIZED, 'Incorrect email or password');
  }

  logger.info('Supabase authentication response', {
    email,
    hasData: !!data,
    hasUser: !!(data && data.user),
    userId: data && data.user ? data.user.id : null,
    email: data && data.user ? data.user.email : null
  });

  if (!data.user) {
    logger.warn('Authentication successful but no user data returned', { email });
    throw new ApiError(status.UNAUTHORIZED, 'Failed to authenticate user');
  }

  logger.info('Supabase authentication successful', { email, userId: data.user.id });

  // Get user from our database
  logger.info('Attempting to find user in local database', { email });
  let user = await userService.getUserByEmail(email);
  logger.info('User lookup result', { email, found: !!user, user: user ? { id: user.id, email: user.email, role: user.role, is_archived: user.is_archived } : null });

  if (!user) {
    logger.warn('User authenticated via Supabase but not found in local database', { email });
    // Create user in local database if they exist in Supabase but not locally
    const userPayload = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || data.user.email.split('@')[0],
      phone: data.user.user_metadata?.phone || null,
      role: data.user.user_metadata?.role || 'user',
      profile_picture: data.user.user_metadata?.profile_picture || null,
      is_email_verified: data.user.email_confirmed_at ? true : false
    };

    logger.info('Attempting to create user in local database', { email, userPayload });
    try {
      user = await userService.createUser(userPayload);
      logger.info('User created in local database', { userId: user.id, email });
    } catch (creationError) {
      logger.error('Failed to create user in local database', {
        email,
        error: creationError.message,
        stack: creationError.stack,
        userPayload,
        detailedError: creationError
      });

      // Provide more specific error messages based on the error type
      if (creationError.code === '23505') { // Unique constraint violation
        throw new ApiError(status.BAD_REQUEST, 'A user with this email already exists in the local database');
      } else if (creationError.message.includes('connect')) {
        throw new ApiError(status.INTERNAL_SERVER_ERROR, 'Database connection error - unable to create local user profile');
      } else {
        throw new ApiError(status.INTERNAL_SERVER_ERROR, 'Failed to create local user profile: ' + creationError.message);
      }
    }
  }

  if (requiredRole && user.role !== requiredRole) {
    logger.warn('Unauthorized access attempt', { userId: user.id, role: user.role, requiredRole });
    throw new ApiError(status.FORBIDDEN, 'You are not authorized to access this resource');
  }

  logger.info('User authenticated successfully', { userId: user.id, role: user.role });

  // Generate JWT tokens
  const tokens = await tokenService.generateAuthTokens(user);

  return { user, tokens };
};

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, tokens } = await authenticateUser(email, password);

  res.status(status.OK).send({
    user,
    tokens,
    access_token: tokens.access.token,
    refresh_token: tokens.refresh.token,
    expires_in: tokens.access.expires,
    message: 'Login successful'
  });
});

const loginAdmin = catchAsync(async (req, res) => {
  logger.info('Login admin request received', { email: req.body.email });
  const { email, password } = req.body;

  const { user, tokens } = await authenticateUser(email, password, 'admin');

  logger.info('Admin login successful', { userId: user.id, role: user.role });

  res.status(status.OK).send({
    user,
    tokens,
    message: 'Admin login successful'
  });
});

// Forgot password implementation
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(status.BAD_REQUEST, 'Email is required');
  }

  if (!isValidEmail(email)) {
    throw new ApiError(status.BAD_REQUEST, 'Please provide a valid email address');
  }

  const supabase = getSupabaseClient();

  // Check if user exists
  const user = await userService.getUserByEmail(email);
  if (!user) {
    // We don't reveal if the email exists or not for security reasons
    return res.status(status.OK).send({
      message: 'If your email is registered, you will receive a password reset link shortly'
    });
  }

  // Use Supabase's password reset functionality
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${config.portalBaseUrl}/reset-password`
  });

  if (error) {
    logger.error('Password reset request failed', { email, error: error.message });
    // Still return success for security reasons
    return res.status(status.OK).send({
      message: 'If your email is registered, you will receive a password reset link shortly'
    });
  }

  logger.info('Password reset email sent', { email });
  res.status(status.OK).send({
    message: 'If your email is registered, you will receive a password reset link shortly'
  });
});

// Change password implementation
const changePassword = catchAsync(async (req, res) => {
  // In a real implementation, this would use the token from the reset email
  // For now, we'll implement a simple version that requires authentication
  const { newPassword } = req.body;
  const userId = req.user.id; // From auth middleware

  if (!newPassword) {
    throw new ApiError(status.BAD_REQUEST, 'New password is required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(status.BAD_REQUEST, 'Password must be at least 6 characters long');
  }

  const supabase = getSupabaseClient();

  // Update password in Supabase
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword
  });

  if (error) {
    logger.error('Password change failed', { userId, error: error.message });
    throw new ApiError(status.INTERNAL_SERVER_ERROR, 'Failed to change password');
  }

  logger.info('Password changed successfully', { userId });
  res.status(status.OK).send({
    message: 'Password changed successfully'
  });
});

const refreshTokens = catchAsync(async (req, res) => {
  // Extract refresh token from body (for Bearer token approach)
  const refreshToken = req.body.refreshToken || req.query.refreshToken;

  if (!refreshToken) {
    throw new ApiError(status.UNAUTHORIZED, 'Refresh token not found');
  }

  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user_id);

    if (!user) {
      throw new ApiError(status.UNAUTHORIZED, 'User not found');
    }

    // Generate new tokens
    const newTokens = await tokenService.generateAuthTokens(user);

    // Blacklist the old refresh token
    await tokenService.blacklistToken(refreshTokenDoc);

    res.status(status.OK).send({
      tokens: newTokens,
      message: 'Tokens refreshed successfully'
    });
  } catch (error) {
    logger.error('Token refresh failed:', error);
    throw new ApiError(status.UNAUTHORIZED, 'Invalid refresh token');
  }
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(status.NO_CONTENT).send();
});

/**
 * Send OTP via Supabase Auth
 */
const sendOtp = catchAsync(async (req, res) => {
  const { username } = req.body;

  if (!username) {
    throw new ApiError(status.BAD_REQUEST, 'Email is required');
  }

  if (!isValidEmail(username)) {
    throw new ApiError(status.BAD_REQUEST, 'Please provide a valid email address');
  }

  // Use Supabase's native sign in with OTP
  const { error } = await supabase.auth.signInWithOtp({
    email: username
  });

  if (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, `Failed to send OTP: ${error.message}`);
  }

  res.status(status.OK).send({
    message: 'OTP sent successfully to your email'
  });
});

/**
 * Verify OTP via Supabase Auth and login
 */
const verifyOtp = catchAsync(async (req, res) => {
  const { username, token } = req.body;

  if (!username || !token) {
    throw new ApiError(status.BAD_REQUEST, 'Email and OTP are required');
  }

  if (!isValidEmail(username)) {
    throw new ApiError(status.BAD_REQUEST, 'Please provide a valid email address');
  }

  // Use Supabase's native verify OTP
  const { data, error } = await supabase.auth.verifyOtp({
    email: username,
    token: token,
    type: 'magiclink'
  });

  if (error) {
    logger.error('OTP verification failed', { email: username, error: error.message });
    throw new ApiError(status.UNAUTHORIZED, `Invalid OTP: ${error.message}`);
  }

  if (!data.user) {
    throw new ApiError(status.UNAUTHORIZED, 'Failed to authenticate user');
  }

  // Get user from our database
  const user = await userService.getUserByEmail(username);
  if (!user) {
    throw new ApiError(status.UNAUTHORIZED, 'User not found');
  }

  // Generate our own tokens
  const tokens = await tokenService.generateAuthTokens(user);

  logger.info('OTP login successful', { userId: user.id, role: user.role });

  res.status(status.OK).send({
    message: 'Login successful',
    user,
    tokens
  });
});

// Resend OTP implementation (with the typo to match mobile app)
const resendOtp = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(status.BAD_REQUEST, 'Email is required');
  }

  if (!isValidEmail(email)) {
    throw new ApiError(status.BAD_REQUEST, 'Please provide a valid email address');
  }

  const supabase = getSupabaseClient();

  // Use Supabase's native sign in with OTP (same as sendOtp)
  const { error } = await supabase.auth.signInWithOtp({
    email: email
  });

  if (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, `Failed to resend OTP: ${error.message}`);
  }

  res.status(status.OK).send({
    message: 'OTP resent successfully to your email'
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new ApiError(status.BAD_REQUEST, 'Token and new password are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(status.BAD_REQUEST, 'Password must be at least 6 characters long');
  }

  const supabase = getSupabaseClient();

  // Use Supabase's native method to reset password with token
  const { data, error } = await supabase.auth.verifyOtp({
    token,
    type: 'recovery'
  });

  if (error) {
    logger.error('Password reset failed', { error: error.message });
    throw new ApiError(status.UNAUTHORIZED, 'Invalid or expired password reset token');
  }

  // Update the user's password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (updateError) {
    logger.error('Failed to update password after reset', { userId: data.user.id, error: updateError.message });
    throw new ApiError(status.INTERNAL_SERVER_ERROR, 'Failed to reset password');
  }

  logger.info('Password reset successful', { userId: data.user.id });

  res.status(status.OK).send({
    message: 'Password reset successfully'
  });
});

module.exports = {
  register,
  login,
  loginAdmin,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
  changePassword,
  resendOtp
};
