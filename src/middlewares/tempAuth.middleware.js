const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const config = require('../config/config');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const logger = require('../config/logger');

const tempAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  logger.info('Token verification attempt:', token);

  if (!token) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'No token provided'));
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret);

    if (payload.type !== tokenTypes.TEMP_TOKEN) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Invalid token type'));
    }

    req.user = payload.sub;
    logger.info('Token verified successfully');
    next();

  } catch (err) {
    logger.error('Token verification failed:', err);
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Token verification failed'));
  }
};

module.exports = tempAuth;
