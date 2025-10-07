const logger = require('../config/logger');
const dbManager = require('../db/dbManager');
const socketService = require('./socket.service');

/**
 * Real-time service for handling real-time events and database subscriptions
 */
class RealtimeService {
  constructor() {
    this.subscriptions = new Map();
    this.eventHandlers = new Map();
  }

  async initialize() {
    this.setupEventHandlers();
    try {
      this.setupDatabaseSubscriptions();
      logger.info('Real-time service initialized');
    } catch (error) {
      logger.error('Failed to initialize real-time service:', error.message);
      // Continue without real-time subscriptions
    }
  }

  /**
   * Set up real-time database subscriptions
   */
  setupDatabaseSubscriptions() {
    // Check if dbManager has subscribeToTable method
    if (typeof dbManager.subscribeToTable !== 'function') {
      logger.warn('dbManager does not support real-time subscriptions, skipping setup');
      return;
    }

    // Subscribe to appointment changes
    const appointmentSubscription = dbManager.subscribeToTable('appointments', this.handleAppointmentChange.bind(this), 'realtime:appointments');

    // Subscribe to user changes
    const userSubscription = dbManager.subscribeToTable('users', this.handleUserChange.bind(this), 'realtime:users');

    // Subscribe to availability changes (if needed, add a handleAvailabilityChange method)
    // For now, I'll assume it's not directly subscribed here, but handled by other events.

    logger.info('Real-time database subscriptions set up');
  }

  /**
   * Set up default event handlers
   */
  setupEventHandlers() {
    // Handle appointment creation
    this.registerEventHandler('appointmentCreated', (data) => {
      logger.info('Appointment created:', data);
      // Broadcast to all connected clients
      socketService.broadcastToAll('appointmentCreated', data);
    });

    // Handle appointment updates
    this.registerEventHandler('appointmentUpdated', (data) => {
      logger.info('Appointment updated:', data);
      // Broadcast to all connected clients
      socketService.broadcastToAll('appointmentUpdated', data);

      // Also send to the specific user if we have their ID
      if (data.appointment && data.appointment.user) {
        socketService.broadcastToUser(data.appointment.user, 'userAppointmentUpdated', data);
      }
    });

    // Handle appointment deletion
    this.registerEventHandler('appointmentDeleted', (data) => {
      logger.info('Appointment deleted:', data);
      // Broadcast to all connected clients
      socketService.broadcastToAll('appointmentDeleted', data);
    });

    // Handle appointment doctor changes
    this.registerEventHandler('appointmentDoctorChanged', (data) => {
      logger.info('Appointment doctor changed:', data);
      // Broadcast to all connected clients
      socketService.broadcastToAll('appointmentDoctorChanged', data);
    });

    // Handle invoice updates
    this.registerEventHandler('invoiceUpdated', (data) => {
      logger.info('Invoice updated:', data);
      // Broadcast to all connected clients
      socketService.broadcastToAll('invoiceUpdated', data);
    });

    // Handle invoice deletion
    this.registerEventHandler('invoiceDeleted', (data) => {
      logger.info('Invoice deleted:', data);
      // Broadcast to all connected clients
      socketService.broadcastToAll('invoiceDeleted', data);
    });

    // Handle stream channel creation
    this.registerEventHandler('streamChannelCreated', (data) => {
      logger.info('Stream channel created:', data);
      // Send to the specific user
      if (data.appointmentId) {
        // We would need to look up the appointment to get the user ID
        // For now, we'll broadcast to all
        socketService.broadcastToAll('streamChannelCreated', data);
      }
    });

    // Handle user creation
    this.registerEventHandler('userCreated', (data) => {
      logger.info('User created:', data);
      // Broadcast to all connected clients
      socketService.broadcastToAll('userCreated', data);
    });

    // Handle user updates
    this.registerEventHandler('userUpdated', (data) => {
      logger.info('User updated:', data);
      // Broadcast to all connected clients
      socketService.broadcastToAll('userUpdated', data);

      // Also send to the specific user if we have their ID
      if (data.userId) {
        socketService.broadcastToUser(data.userId, 'selfUserUpdated', data);
      }
    });

    // Handle user archiving
    this.registerEventHandler('userArchived', (data) => {
      logger.info('User archived:', data);
      // Broadcast to all connected clients
      socketService.broadcastToAll('userArchived', data);
    });

    // Handle availability set/updated
    this.registerEventHandler('availabilitySet', (data) => {
      logger.info('Availability set/updated:', data);
      // Broadcast to all connected clients
      socketService.broadcastToAll('availabilitySet', data);

      // Also send to the specific doctor if we have their ID
      if (data.availability && data.availability.user) {
        socketService.broadcastToUser(data.availability.user, 'doctorAvailabilityUpdated', data);
      }
    });

    // Handle availability updates
    this.registerEventHandler('availabilityUpdated', (data) => {
      logger.info('Availability updated:', data);
      // Broadcast to all connected clients
      socketService.broadcastToAll('availabilityUpdated', data);
    });

    // Handle availability deletion
    this.registerEventHandler('availabilityDeleted', (data) => {
      logger.info('Availability deleted:', data);
      // Broadcast to all connected clients
      socketService.broadcastToAll('availabilityDeleted', data);
    });

    // Handle doctor availability updates
    this.registerEventHandler('doctorAvailabilityUpdated', (data) => {
      logger.info('Doctor availability updated:', data);
      // Broadcast to all connected clients
      socketService.broadcastToAll('doctorAvailabilityUpdated', data);
    });

    // Handle SMS received
    this.registerEventHandler('smsReceived', (data) => {
      logger.info('SMS received:', data);
      // Broadcast to all connected clients
      socketService.broadcastToAll('smsReceived', data);
    });

    // Handle OTP requested
    this.registerEventHandler('otpRequested', (data) => {
      logger.info('OTP requested:', data);
      // Send to the specific user
      if (data.userId) {
        socketService.broadcastToUser(data.userId, 'otpRequested', data);
      }
    });

    // Handle OTP verified
    this.registerEventHandler('otpVerified', (data) => {
      logger.info('OTP verified:', data);
      // Send to the specific user
      if (data.userId) {
        socketService.broadcastToUser(data.userId, 'otpVerified', data);
      }
    });
  }

  /**
   * Emit an event to all registered handlers
   * @param {string} eventName - The name of the event to emit
   * @param {Object} data - The data to pass to the event handlers
   */
  emitEvent(eventName, data) {
    const handlers = this.eventHandlers.get(eventName);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          logger.error(`Error in event handler for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Register an event handler for a specific event
   * @param {string} eventName - The name of the event to handle
   * @param {Function} handler - The handler function
   */
  registerEventHandler(eventName, handler) {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, new Set());
    }
    this.eventHandlers.get(eventName).add(handler);
  }

  /**
   * Handle appointment changes
   * @param {Object} payload - The database change payload
   */
  handleAppointmentChange(payload) {
    logger.info('Processing appointment change:', payload);

    // Emit the event to registered handlers
    this.emitEvent('appointmentChange', {
      eventType: payload.eventType,
      record: payload.new || payload.old,
      timestamp: new Date()
    });
  }

  /**
   * Handle user changes
   * @param {Object} payload - The database change payload
   */
  handleUserChange(payload) {
    logger.info('Processing user change:', payload);

    // Emit the event to registered handlers
    this.emitEvent('userChange', {
      eventType: payload.eventType,
      record: payload.new || payload.old,
      timestamp: new Date()
    });
  }

  /**
   * Handle availability changes
   * @param {Object} payload - The database change payload
   */
  handleAvailabilityChange(payload) {
    logger.info('Processing availability change:', payload);

    // Emit the event to registered handlers
    this.emitEvent('availabilityChange', {
      eventType: payload.eventType,
      record: payload.new || payload.old,
      timestamp: new Date()
    });
  }
}

module.exports = new RealtimeService();