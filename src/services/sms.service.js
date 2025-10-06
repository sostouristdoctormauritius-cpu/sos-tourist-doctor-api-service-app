const logger = require('../config/logger');

const twilioService = require('./twilio.service');
const vonageService = require('./vonage.service');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Unified SMS service that uses Twilio as primary and Vonage as fallback
 * @param {string} toPhoneNumber - The recipient's phone number
 * @param {string} messageBody - The message content
 * @returns {Promise<Object>} - The result of the SMS sending operation
 */
const sendSMS = async (toPhoneNumber, messageBody) => {
  try {
    // Try Twilio first (primary SMS service)
    logger.info('Attempting to send SMS via Twilio (primary service)');
    const result = await twilioService.sendSMS(toPhoneNumber, messageBody); // Corrected call
    logger.info('SMS sent successfully via Twilio');
    return { service: 'twilio', result };
  } catch (twilioError) {
    logger.error('Twilio SMS failed:', twilioError.message);

    // Fallback to Vonage (secondary SMS service)
    try {
      logger.info('Falling back to Vonage SMS service');
      const result = await vonageService.sendSMS(toPhoneNumber, messageBody);
      logger.info('SMS sent successfully via Vonage');
      return { service: 'vonage', result };
    } catch (vonageError) {
      logger.error('Vonage SMS also failed:', vonageError.message);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `SMS sending failed via both services. Twilio: ${twilioError.message}, Vonage: ${vonageError.message}`); // Throws ApiError
    }
  }
};

module.exports = sendSMS;
