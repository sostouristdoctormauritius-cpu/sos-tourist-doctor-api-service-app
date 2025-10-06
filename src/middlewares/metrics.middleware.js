const metricsService = require('../services/metrics.service');
const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');

/**
 * Metrics Middleware
 * Tracks API requests and collects metrics
 */
const metricsMiddleware = (req, res, next) => {
  // Generate unique request ID
  const requestId = uuidv4();
  req.requestId = requestId;
  
  // Record start time
  const startTime = Date.now();
  metricsService.startRequestTracking(requestId, req.method);
  
  // Capture response end to calculate duration
  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - startTime;
    
    // Track request completion
    metricsService.endRequestTracking(requestId, res.statusCode, duration);
    
    // Call original send method
    originalSend.call(this, body);
  };
  
  // Track errors
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      metricsService.trackError(`HTTP_${res.statusCode}`);
    }
  });
  
  next();
};

module.exports = metricsMiddleware;