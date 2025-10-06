const logger = require('../config/logger');
const dbManager = require('../db/dbManager');
const twilioService = require('./twilio.service');
const emailService = require('./email.service');
const { getAvailableDoctors } = require('./doctor.service');

/**
 * Send SOS notifications to available doctors
 * @param {Object} sosData - SOS request data
 * @param {string} sosData.userId - User ID who triggered SOS
 * @param {Object} sosData.location - Location coordinates
 * @param {number} sosData.location.latitude - Latitude
 * @param {number} sosData.location.longitude - Longitude
 * @returns {Promise<Object>} Result of notification sending
 */
const sendSOSNotifications = async (sosData) => {
  try {
    const { userId, location } = sosData;

    // Get user details
    const user = await dbManager.findById('users', userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get available doctors
    const availableDoctors = await getAvailableDoctors();

    if (availableDoctors.length === 0) {
      logger.warn('No available doctors found for SOS request', { userId });
      // Send notification to admin if no doctors available
      await notifyAdminNoDoctorsAvailable(user, location);
      return { success: true, message: 'SOS registered, no doctors currently available' };
    }

    // Send notifications to available doctors
    const notificationPromises = availableDoctors.map(doctor =>
      notifyDoctor(doctor, user, location)
    );

    // Send SMS/email to emergency contacts
    const emergencyContactPromises = [];
    if (user.emergencyContacts && user.emergencyContacts.length > 0) {
      user.emergencyContacts.forEach(contact => {
        emergencyContactPromises.push(notifyEmergencyContact(contact, user, location));
      });
    }

    // Trigger real-time notifications
    await triggerRealTimeNotifications(availableDoctors, user, location);

    // Wait for all notifications to be sent
    await Promise.all([...notificationPromises, ...emergencyContactPromises]);

    logger.info('SOS notifications sent successfully', {
      userId,
      doctorsNotified: availableDoctors.length,
      emergencyContactsNotified: user.emergencyContacts ? user.emergencyContacts.length : 0
    });

    return {
      success: true,
      message: 'SOS notifications sent to doctors and emergency contacts',
      doctorsNotified: availableDoctors.length
    };
  } catch (error) {
    logger.error('Error sending SOS notifications', { error: error.message, sosData });
    throw error;
  }
};

/**
 * Notify a doctor about an SOS request
 * @param {Object} doctor - Doctor object
 * @param {Object} user - User who triggered SOS
 * @param {Object} location - Location coordinates
 */
const notifyDoctor = async (doctor, user, location) => {
  try {
    // Send SMS notification to doctor
    if (doctor.phone) {
      await twilioService.sendSMS(doctor.phone, `SOS ALERT: Patient ${user.name} needs immediate assistance. Location: https://maps.google.com/?q=${location.latitude},${location.longitude}`);
    }

    // Send email notification to doctor
    if (doctor.email) {
      await emailService.sendEmail({
        to: doctor.email,
        subject: 'SOS ALERT - Patient Needs Immediate Assistance',
        text: `Patient ${user.name} has triggered an SOS alert and needs immediate assistance.\n\nLocation: https://maps.google.com/?q=${location.latitude},${location.longitude}\n\nPlease respond as soon as possible.`
      });
    }

    logger.info('Doctor notified about SOS', { doctorId: doctor.id, userId: user.id });
  } catch (error) {
    logger.error('Error notifying doctor about SOS', {
      error: error.message,
      doctorId: doctor.id,
      userId: user.id
    });
  }
};

/**
 * Notify emergency contacts about an SOS request
 * @param {Object} contact - Emergency contact object
 * @param {Object} user - User who triggered SOS
 * @param {Object} location - Location coordinates
 */
const notifyEmergencyContact = async (contact, user, location) => {
  try {
    // Send SMS notification to emergency contact
    if (contact.phone) {
      await twilioService.sendSMS(contact.phone, `EMERGENCY ALERT: ${user.name} has triggered an SOS alert. Location: https://maps.google.com/?q=${location.latitude},${location.longitude}`);
    }

    // Send email notification to emergency contact
    if (contact.email) {
      await emailService.sendEmail({
        to: contact.email,
        subject: 'EMERGENCY ALERT - Family Member Needs Assistance',
        text: `Your family member ${user.name} has triggered an SOS emergency alert.\n\nLocation: https://maps.google.com/?q=${location.latitude},${location.longitude}\n\nPlease check on them immediately.`
      });
    }

    logger.info('Emergency contact notified about SOS', { contact, userId: user.id });
  } catch (error) {
    logger.error('Error notifying emergency contact about SOS', {
      error: error.message,
      contact,
      userId: user.id
    });
  }
};

/**
 * Trigger real-time notifications through WebSocket
 * @param {Array} doctors - Array of doctors to notify
 * @param {Object} user - User who triggered SOS
 * @param {Object} location - Location coordinates
 */
const triggerRealTimeNotifications = async (doctors, user, location) => {
  try {
    // This would integrate with your WebSocket implementation
    // For now, we'll just log that this would happen
    logger.info('Real-time notifications triggered', {
      doctorIds: doctors.map(d => d.id),
      userId: user.id,
      location
    });

    // In a real implementation, you would emit events to connected doctors via WebSocket
    // Example:
    // doctors.forEach(doctor => {
    //   socketService.emitToUser(doctor.id, 'sos-alert', {
    //     user,
    //     location,
    //     timestamp: new Date()
    //   });
    // });
  } catch (error) {
    logger.error('Error triggering real-time notifications', {
      error: error.message,
      userId: user.id
    });
  }
};

/**
 * Notify admin when no doctors are available
 * @param {Object} user - User who triggered SOS
 * @param {Object} location - Location coordinates
 */
const notifyAdminNoDoctorsAvailable = async (user, location) => {
  try {
    // Get admin users from database
    const admins = await dbManager.findMany('users', { role: 'admin' });

    // Send notifications to all admins
    const notificationPromises = admins.map(admin => {
      if (admin.phone) {
        return twilioService.sendSMS(admin.phone, `ADMIN ALERT: No doctors available for SOS from user ${user.name}. Location: https://maps.google.com/?q=${location.latitude},${location.longitude}`);
      }
    });

    await Promise.all(notificationPromises);

    logger.info('Admin notified about no available doctors', { userId: user.id });
  } catch (error) {
    logger.error('Error notifying admin about no available doctors', {
      error: error.message,
      userId: user.id
    });
  }
};

/**
 * Get SOS history for a user
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} SOS history
 */
const getUserSOSHistory = async (userId, options = {}) => {
  try {
    const sosHistory = await dbManager.findMany('sos_requests', { userId }, options);
    return sosHistory;
  } catch (error) {
    logger.error('Error fetching SOS history', { error: error.message, userId });
    throw error;
  }
};

/**
 * Get all SOS requests (admin only)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} All SOS requests
 */
const getAllSOSRequests = async (options = {}) => {
  try {
    const sosRequests = await dbManager.findMany('sos_requests', {}, options);
    return sosRequests;
  } catch (error) {
    logger.error('Error fetching all SOS requests', { error: error.message });
    throw error;
  }
};

module.exports = {
  sendSOSNotifications,
  getUserSOSHistory,
  getAllSOSRequests
};
