const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');
const { userService } = require('../services');
const logger = require('../config/logger');

// Initialize Supabase client for Auth operations
const dbManager = require('../db/dbManager');

// Initialize Supabase client for Auth operations
const supabase = dbManager.getDbClient();

/**
 * Supabase authentication middleware
 * Verifies the Supabase JWT token and attaches the user to the request
 */
const supabaseAuth = () => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Authorization token missing or invalid');
    }

    const token = authHeader.split(' ')[1];

    // Verify the token using Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
    }

    // Attach the Supabase user to the request
    req.supabaseUser = user;

    // Fetch user from our local database
    const localUser = await userService.getUserById(user.id); // Assuming Supabase user ID matches local user ID
    if (!localUser) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found in local database');
    }

    // Attach the local user to the request
    req.user = localUser;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Admin-only authentication middleware
 */
const adminAuth = () => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate first'));
  }
  if (req.user.role !== 'admin') {
    return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden: Admin access required'));
  }
  next();
};

module.exports = {
  supabaseAuth,
  adminAuth
};
