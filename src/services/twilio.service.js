const twilio = require('twilio');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

// Only initialize Twilio client if credentials are provided
let client = null;
let isConfigured = false;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (accountSid && authToken && twilioPhoneNumber) {
  client = new twilio(accountSid, authToken);
  isConfigured = true;
} else {
  logger.warn('Twilio not configured: Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER');
  if (!accountSid) logger.warn('Missing TWILIO_ACCOUNT_SID');
  if (!authToken) logger.warn('Missing TWILIO_AUTH_TOKEN');
  if (!twilioPhoneNumber) logger.warn('Missing TWILIO_PHONE_NUMBER');
}

// Function to send SMS
const sendSMS = async (toPhoneNumber, messageBody) => {
  // If Twilio is not configured, log a warning and return
  if (!isConfigured) {
    logger.warn('Twilio not configured. SMS not sent:', { toPhoneNumber, messageBody });
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Twilio service not configured');
  }

  try {
    const message = await client.messages.create({
      body: messageBody,
      to: toPhoneNumber, // dynamic recipient
      from: twilioPhoneNumber // Use proper environment variable
    });

    logger.info(`Message sent with SID: ${message.sid}`);
    return message;
  } catch (err) {
    logger.error('Twilio Error:', { error: err.message, toPhoneNumber });
    throw err;
  }
};

module.exports = sendSMS;
