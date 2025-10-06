const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config');
const { tokenTypes } = require('./tokens');
const { userService } = require('../services');
const logger = require('../config/logger');
const httpStatus = require('http-status').default || require('http-status');
const ApiError = require('../utils/ApiError');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Simple JWT strategy using Supabase
const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  passReqToCallback: true // Pass req to verify callback
};

const jwtVerify = async (req, payload, done) => {
  try {
    logger.info('JWT verification started', {
      payload,
      authHeader: req.headers.authorization
    });

    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }

    // Special handling for hardcoded admin user
    if (payload.sub === 'admin-user-id') {
      const adminUser = {
        id: 'admin-user-id',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      logger.info('Admin user authenticated');
      return done(null, adminUser);
    }

    // Regular user lookup
    const user = await userService.getUserById(payload.sub);
    if (!user) {
      logger.info('User not found in database', { userId: payload.sub });
      return done(null, false);
    }
    logger.info('User authenticated', { userId: user.id });
    done(null, user);
  } catch (error) {
    logger.error('JWT verification error', { error: error.message, stack: error.stack });
    done(error, false);
  }
};

// Use standard JWT strategy instead of custom one
const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy
};
