const socketIO = require('socket.io');
const logger = require('../config/logger');
const { verifyToken } = require('./token.service');
const { tokenTypes } = require('../config/tokens');
const dbManager = require('../db/dbManager');

// Delayed import to avoid circular dependency
let realtimeService;

/**
 * Socket.IO service for real-time communication
 */
class SocketService {
  constructor() {
    this.io = null;
    this.users = new Map(); // Store connected users
    this.userSubscriptions = new Map(); // Store user-specific database subscriptions
  }

  /**
   * Initialize Socket.IO with the HTTP server
   * @param {http.Server} server - The HTTP server instance
   */
  initialize(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com']
          : '*',
        credentials: true
      }
    });

    // Import realtimeService here to avoid circular dependency issues
    if (!realtimeService) {
      realtimeService = require('./realtime.service');
    }

    this.setupEventHandlers();
    logger.info('Socket.IO initialized');

    // Listen to real-time service events and broadcast them
    if (realtimeService && typeof realtimeService.registerEventHandler === 'function') {
      realtimeService.registerEventHandler('appointmentDbChange', (data) => {
        this.io.emit('appointmentDbChange', data);
      });
      realtimeService.registerEventHandler('userDbChange', (data) => {
        this.io.emit('userDbChange', data);
      });
    } else {
      logger.warn('RealtimeService registerEventHandler not available');
    }
  }

  /**
   * Set up event handlers for Socket.IO connections
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`User connected: ${socket.id}`);

      // Handle user authentication
      socket.on('authenticate', async (data) => {
        try {
          const { token } = data;

          // Verify the JWT token
          const decoded = await verifyToken(token, tokenTypes.ACCESS);

          // Store user info
          const userId = decoded.sub;
          this.users.set(socket.id, { userId, socket });
          logger.info(`User authenticated: ${userId} with socket ${socket.id}`);

          // Notify other clients about the new user
          socket.broadcast.emit('userJoined', { userId });

          // Send success response
          socket.emit('authenticated', { success: true });

          // Set up user-specific subscriptions
          this.setupUserSubscriptions(userId, socket);
        } catch (error) {
          logger.error('Socket authentication error:', error);
          socket.emit('error', { message: 'Authentication failed' });

          // Disconnect the socket if authentication fails
          setTimeout(() => {
            socket.disconnect(true);
          }, 1000);
        }
      });

      // Handle appointment updates
      socket.on('appointmentUpdate', (data) => {
        try {
          const { appointmentId, status, userId } = data;
          logger.info(`Appointment update: ${appointmentId} status changed to ${status}`);

          // Broadcast to relevant users
          this.broadcastToUser(userId, 'appointmentUpdated', {
            appointmentId,
            status,
            timestamp: new Date()
          });
        } catch (error) {
          logger.error('Appointment update error:', error);
        }
      });

      // Handle chat messages
      socket.on('message', (data) => {
        try {
          const { to, from, content } = data;
          logger.info(`Message from ${from} to ${to}: ${content}`);

          // Send to recipient
          this.broadcastToUser(to, 'message', {
            from,
            content,
            timestamp: new Date()
          });
        } catch (error) {
          logger.error('Message error:', error);
        }
      });

      // Handle typing indicators
      socket.on('typing', (data) => {
        try {
          const { to, from, isTyping } = data;
          this.broadcastToUser(to, 'typing', {
            from,
            isTyping
          });
        } catch (error) {
          logger.error('Typing indicator error:', error);
        }
      });

      // Handle user disconnection
      socket.on('disconnect', () => {
        logger.info(`User disconnected: ${socket.id}`);
        const user = this.users.get(socket.id);
        if (user) {
          socket.broadcast.emit('userLeft', { userId: user.userId });
          this.cleanupUserSubscriptions(user.userId);
          this.users.delete(socket.id);
        }
      });

      // Handle connection errors
      socket.on('error', (error) => {
        logger.error('Socket error:', error);
      });
    });
  }



  /**
   * Set up user-specific subscriptions
   * @param {string} userId - The user ID
   * @param {Socket} socket - The socket instance
   */
  setupUserSubscriptions(userId, socket) {
    // Subscribe to user's appointments
    const appointmentSubscription = dbManager.subscribeToTableWithFilter(
      'appointments',
      { user: userId },
      (payload) => {
        logger.info(`User ${userId} appointment change detected:`, payload);

        // Send the change to the specific user
        socket.emit('userAppointmentChange', {
          eventType: payload.eventType,
          record: payload.new || payload.old,
          timestamp: new Date()
        });
      },
      `user:${userId}:appointments`
    );

    // Store the subscription
    if (!this.userSubscriptions.has(userId)) {
      this.userSubscriptions.set(userId, []);
    }
    this.userSubscriptions.get(userId).push(`user:${userId}:appointments`);

    logger.info(`Set up user-specific subscriptions for user ${userId}`);
  }

  /**
   * Clean up user-specific subscriptions
   * @param {string} userId - The user ID
   */
  async cleanupUserSubscriptions(userId) {
    const subscriptions = this.userSubscriptions.get(userId);
    if (subscriptions) {
      for (const subscriptionName of subscriptions) {
        await dbManager.unsubscribeFromChannel(subscriptionName);
      }
      this.userSubscriptions.delete(userId);
      logger.info(`Cleaned up subscriptions for user ${userId}`);
    }
  }

  /**
   * Broadcast a message to a specific user
   * @param {string} userId - The user ID to broadcast to
   * @param {string} event - The event name
   * @param {Object} data - The data to send
   */
  broadcastToUser(userId, event, data) {
    for (const [socketId, user] of this.users.entries()) {
      if (user.userId === userId) {
        this.io.to(socketId).emit(event, data);
      }
    }
  }

  /**
   * Broadcast a message to all connected users
   * @param {string} event - The event name
   * @param {Object} data - The data to send
   */
  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }

  /**
   * Get the current number of connected users
   * @returns {number} The number of connected users
   */
  getConnectedUserCount() {
    return this.users.size;
  }
}

module.exports = new SocketService();
