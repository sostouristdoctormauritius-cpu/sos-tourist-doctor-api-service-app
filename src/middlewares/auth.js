const passport = require('passport');
const httpStatus = require('http-status').default || require('http-status');
const ApiError = require('../utils/ApiError');
const { roleRights } = require('../config/roles');
const logger = require('../config/logger');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  // If no required rights, allow the request to proceed (public route)
  if (requiredRights.length === 0) {
    logger.info('Public route accessed without authentication');
    return resolve();
  }

  if (err || info || !user) {
    logger.info('Authentication error:', { err: err?.message, info: info?.message, user });

    const errorMessage = err ? err.message : (info ? info.message : 'Please authenticate');
    logger.info('Other authentication error:', { errorMessage });
    return reject(new ApiError(httpStatus.UNAUTHORIZED, errorMessage));
  }
  req.user = user;

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    if (!userRights) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Role not recognized'));
    }

    const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};

const auth = (...requiredRights) => async (req, res, next) => {
  // If no required rights are specified, this is a public route
  if (requiredRights.length === 0) {
    return next();
  }

  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
  })
    .then(() => next())
    .catch((err) => {
      // If it's already an ApiError, pass it along without wrapping it again
      if (err instanceof ApiError) {
        next(err);
      } else {
        // Handle any other unexpected errors
        next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
      }
    });
};

module.exports = auth;
