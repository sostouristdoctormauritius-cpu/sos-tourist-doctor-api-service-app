const dotenv = require('dotenv');
const config = require('./config/config');
const dbManager = require('./db/dbManager');
const app = require('./app');

const logger = require('./config/logger');
const socketService = require('./services/socket.service');
const realtimeService = require('./services/realtime.service');

let server;

// Connect to the configured primary database (Supabase)
dbManager.connect().then(() => {
  logger.info(`✅ Connected to ${config.primaryDb} as PRIMARY database`);

  // Initialize the real-time service
  realtimeService.initialize().then(() => {
    logger.info('✅ Real-time service initialized');
  }).catch(error => {
    logger.error('❌ Failed to initialize real-time service:', error);
  });

  // Start the server
  server = app.listen(config.port, () => {
    logger.info(`✅ Listening on port ${config.port} in ${config.env} mode`);
    logger.info(`🎯 Environment: ${config.env}`);
    logger.info(`📡 Primary DB: ${config.primaryDb}`);

    // Initialize Socket.IO service
    socketService.initialize(server);
    logger.info('✅ Socket.IO service initialized');
  });
}).catch(error => {
  logger.error('❌ Failed to connect to database:', error);
  process.exit(1);
});


const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error('Unexpected error:', error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  exitHandler();
});

process.on('SIGINT', () => {
  logger.info('SIGINT received');
  exitHandler();
});
