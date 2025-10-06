const { status } = require('http-status');
const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');
const dbManager = require('../db/dbManager');
const { tokenTypes } = require('../config/tokens');
const config = require('../config/config');
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

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (
  email,
  password
) => {
  logger.info('Attempting to find user with email:', email);

  let user;
  try {
    logger.info('Calling userService.getActiveUserByEmailOrPhone');
    user = await userService.getActiveUserByEmailOrPhone(email);
    logger.info('User lookup completed', { found: !!user });
  } catch (error) {
    logger.error('Error during user lookup', {
      email,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }

  if (!user) {
    logger.info('User not found', { email });
    throw new ApiError(status.UNAUTHORIZED, 'Incorrect email or password');
  }

  // Password verification
  logger.info('Checking if password matches', { userId: user.id });
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    logger.info('Password does not match', { userId: user.id });
    throw new ApiError(status.UNAUTHORIZED, 'Incorrect email or password');
  }

  logger.info('Login successful', { userId: user.id }); // Removed "password verification bypassed"
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await tokenService.removeToken(refreshTokenDoc);
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(
      refreshToken,
      tokenTypes.REFRESH
    );
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    await dbManager.delete('tokens', refreshTokenDoc.id);
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      resetPasswordToken,
      tokenTypes.RESET_PASSWORD
    );
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await dbManager.deleteMany('tokens', { user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(
      verifyEmailToken,
      tokenTypes.VERIFY_EMAIL
    );
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
    }
    await dbManager.deleteMany('tokens', { user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

/**
 * Send OTP to user's email using Supabase Auth
 * @param {string} email
 * @returns {Promise<Object>}
 */
const sendOtpWithSupabase = async (email) => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email
  });

  if (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to send OTP: ${error.message}`);
  }

  return data;
};

/**
 * Verify OTP using Supabase Auth
 * @param {string} email
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Object>}
 */
const verifyOtpWithSupabase = async (email, token, type = 'magiclink') => {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: email,
    token: token,
    type: type
  });

  if (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, `Invalid OTP: ${error.message}`);
  }

  return data;
};

const sendOtpForUser = async (user) => {
  logger.info('Generating OTP for user:', user.id);
  const otpCode = Math.floor(1000 + Math.random() * 9000).toString(); // 6-digit OTP
  const expiresAt = new Date(Date.now() + config.otpExpiryMinutes * 60 * 1000); // Use config for expiry
  const userId = user._id || user.id;

  try {
    // Encapsulate OTP database operations within userService or a dedicated otpService
    // For now, I'll assume userService handles this.
    // If Otp is a separate model, it should be imported and handled here or in a dedicated service.
    // Assuming userService.createOtp and userService.deleteOtpsByUserId exist
    await userService.deleteOtpsByUserId(userId); // Delete old OTPs
    const newOtp = await userService.createOtp(userId, otpCode, expiresAt);

    // If Twilio is to be used, integrate it properly here.
    // For now, just email service.
    await emailService.sendOtpEmail(user.email, newOtp);
    logger.info(`OTP sent to ${user.email}`);
    return newOtp;
  } catch (err) {
    logger.error('Error sending OTP:', err);
    throw new ApiError(status.INTERNAL_SERVER_ERROR, 'Error sending OTP');
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  sendOtpWithSupabase,
  verifyOtpWithSupabase,
  sendOtpForUser
};
