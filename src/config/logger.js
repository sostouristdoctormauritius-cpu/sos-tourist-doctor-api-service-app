const winston = require('winston');
const config = require('./config');

// Custom format for structured logging
const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { 
      message: info.message,
      stack: info.stack
    });
  }
  return info;
});

// JSON format for production, simple format for development
const logFormat = config.env === 'production' 
  ? winston.format.json()
  : winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    );

const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    enumerateErrorFormat(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error']
    })
  ]
});

// Add file transport for production if logs directory exists
if (config.env === 'production') {
  // Ensure logs directory exists
  const fs = require('fs');
  const path = require('path');
  const logsDir = path.join(__dirname, '../../logs');
  
  if (!fs.existsSync(logsDir)) {
    try {
      fs.mkdirSync(logsDir, { recursive: true });
    } catch (err) {
      // If we can't create the directory, continue with console only
      console.warn('Could not create logs directory, using console only');
    }
  }
  
  if (fs.existsSync(logsDir)) {
    logger.add(new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }));
    
    logger.add(new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }));
  }
}

module.exports = logger;