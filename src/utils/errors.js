const httpStatus = require('http-status');

class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class ValidationError extends ApiError {
  constructor(message, details = null) {
    super(httpStatus.BAD_REQUEST, message || 'Validation failed');
    this.name = 'ValidationError';
    this.details = details;
  }
}

class AuthenticationError extends ApiError {
  constructor(message) {
    super(httpStatus.UNAUTHORIZED, message || 'Authentication failed');
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends ApiError {
  constructor(message) {
    super(httpStatus.FORBIDDEN, message || 'Access denied');
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends ApiError {
  constructor(message) {
    super(httpStatus.NOT_FOUND, message || 'Resource not found');
    this.name = 'NotFoundError';
  }
}

class DatabaseError extends ApiError {
  constructor(message, errorDetails = null) {
    super(httpStatus.INTERNAL_SERVER_ERROR, message || 'Database operation failed');
    this.name = 'DatabaseError';
    this.errorDetails = errorDetails;
  }
}

class ExternalServiceError extends ApiError {
  constructor(serviceName, message, errorDetails = null) {
    super(httpStatus.SERVICE_UNAVAILABLE, message || `${serviceName} service unavailable`);
    this.name = 'ExternalServiceError';
    this.serviceName = serviceName;
    this.errorDetails = errorDetails;
  }
}

module.exports = {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  ExternalServiceError
};