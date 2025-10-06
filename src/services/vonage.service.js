const { Vonage } = require('@vonage/server-sdk');

const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

let vonageClient = null;
let isConfigured = false;

const apiKey = process.env.VONAGE_API_KEY;
const apiSecret = process.env.VONAGE_API_SECRET;
const vonagePhoneNumber = process.env.VONAGE_PHONE_NUMBER;

if (apiKey && apiSecret && vonagePhoneNumber) {
  vonageClient = new Vonage({
    apiKey: apiKey,
    apiSecret: apiSecret
  });
  isConfigured = true;
} else {
  logger.warn('Vonage not configured: Missing VONAGE_API_KEY, VONAGE_API_SECRET, or VONAGE_PHONE_NUMBER');
  if (!apiKey) logger.warn('Missing VONAGE_API_KEY');
  if (!apiSecret) logger.warn('Missing VONAGE_API_SECRET');
  if (!vonagePhoneNumber) logger.warn('Missing VONAGE_PHONE_NUMBER');
}

// Function to send SMS via Vonage
const sendSMS = async (toPhoneNumber, messageBody) => {
  // If Vonage is not configured, throw an ApiError
  if (!isConfigured) {
    logger.warn('Vonage not configured. SMS not sent:', { toPhoneNumber, messageBody });
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Vonage service not configured');
  }

  try {
    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedTo = toPhoneNumber.replace(/[^+0-9]/g, '');

    const response = await vonageClient.sms.send({
      to: normalizedTo,
      from: vonagePhoneNumber, // Use vonagePhoneNumber from the config
      text: messageBody
    });

    logger.info('SMS sent successfully via Vonage:', response);
    return response;
  } catch (error) {
    logger.error('Error sending SMS via Vonage:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to send SMS via Vonage: ${error.message}`); // Throw ApiError
  }
};

module.exports = {
  sendSMS
};
