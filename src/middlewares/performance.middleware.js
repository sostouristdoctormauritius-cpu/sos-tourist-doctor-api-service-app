const logger = require('../config/logger');

/**
 * Performance Monitoring Middleware
 * Tracks response times and logs slow requests
 */
const performanceMiddleware = (req, res, next) => {
  const start = process.hrtime.bigint();
  
  // Capture response end to calculate duration
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
    }
    
    // Add performance header
    res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
    
    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

module.exports = performanceMiddleware;