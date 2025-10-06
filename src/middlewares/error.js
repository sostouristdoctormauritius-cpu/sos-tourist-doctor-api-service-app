const { status } = require('http-status');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

const errorConverter = (err, req, res, next) => {
  let error = err;
  logger.info('Error converter called with:', {
    errName: err.name,
    errMessage: err.message,
    errStack: err.stack,
    errStatusCode: err.statusCode,
    isApiError: err instanceof ApiError
  });

  console.log('Error object:', JSON.stringify(err, Object.getOwnPropertyNames(err)));

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || status.INTERNAL_SERVER_ERROR;
    console.log('Calculated status code:', statusCode);
    const message = error.message || status[statusCode] || 'Bad Request';
    console.log('Message:', message);
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

const errorHandler = (err, req, res, next) => {
  logger.info('Error handler called with ApiError:', {
    statusCode: err.statusCode,
    message: err.message,
    isOperational: err.isOperational,
    stack: err.stack
  });

  // Get status code from error object or fallback to Internal Server Error
  let statusCode = err.statusCode;

  // Ensure statusCode is always defined and valid
  if (!statusCode || typeof statusCode !== 'number' || statusCode < 100 || statusCode > 599) {
    statusCode = status.INTERNAL_SERVER_ERROR;
  }

  // Get message from error object or fallback to the HTTP status message
  let message = err.message || status[statusCode];

  // If HTTP status message is missing, use generic error message
  const finalMessage = message || 'Internal Server Error';

  if (config.env === 'production' && !err.isOperational) {
    statusCode = status.INTERNAL_SERVER_ERROR || 500;
    message = 'Internal Server Error';
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message: finalMessage,
    ...(config.env === 'development' && { stack: err.stack })
  };

  if (config.env === 'development') {
    logger.error(err);
  }

  // Ensure we're not sending the response multiple times
  if (!res.headersSent) {
    res.status(statusCode).send(response);
  }
};

module.exports = {
  errorConverter,
  errorHandler
};
