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
const apiUrl = process.env.API_URL || 'http://localhost:3000';

if (accountSid && authToken && twilioPhoneNumber) {
  client = new twilio(accountSid, authToken);
  isConfigured = true;
} else {
  logger.warn('Twilio not configured: Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER');
  if (!accountSid) logger.warn('Missing TWILIO_ACCOUNT_SID');
  if (!authToken) logger.warn('Missing TWILIO_AUTH_TOKEN');
  if (!twilioPhoneNumber) logger.warn('Missing TWILIO_PHONE_NUMBER');
}

/**
 * Make a voice call to a patient using their phone number
 * @param {string} toPhoneNumber - The patient's phone number
 * @param {string} doctorName - The name of the doctor initiating the call
 * @returns {Promise<Object>} - The result of the voice call operation
 */
const makeVoiceCall = async (toPhoneNumber, doctorName) => {
  // If Twilio is not configured, log a warning and return
  if (!isConfigured) {
    logger.warn('Twilio not configured. Voice call not initiated:', { toPhoneNumber });
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Twilio service not configured');
  }

  try {
    // Create a voice call with custom TwiML
    const call = await client.calls.create({
      url: `${apiUrl}/v1/twiml/patient-call`,
      method: 'POST',
      to: toPhoneNumber,
      from: twilioPhoneNumber,
      statusCallback: `${apiUrl}/v1/twiml/call-status`,
      statusCallbackMethod: 'POST',
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      twiml: `<Response>
                <Say voice="alice">Hello, this is a call from SOS Tourist Doctor. Doctor ${doctorName} is calling for your appointment.</Say>
                <Say voice="alice">Please hold while we connect you.</Say>
                <Dial>${process.env.TWILIO_FORWARD_NUMBER || twilioPhoneNumber}</Dial>
              </Response>`
    });

    logger.info(`Voice call initiated with SID: ${call.sid}`);
    return call;
  } catch (err) {
    logger.error('Twilio Voice Call Error:', { error: err.message, toPhoneNumber });
    throw err;
  }
};

/**
 * Make a voice call to a patient with custom TwiML URL
 * @param {string} toPhoneNumber - The patient's phone number
 * @param {string} doctorName - The name of the doctor initiating the call
 * @param {string} twimlUrl - The URL to the TwiML instructions for the call
 * @returns {Promise<Object>} - The result of the voice call operation
 */
const makeVoiceCallWithTwiML = async (toPhoneNumber, doctorName, twimlUrl) => {
  // If Twilio is not configured, log a warning and return
  if (!isConfigured) {
    logger.warn('Twilio not configured. Voice call not initiated:', { toPhoneNumber });
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Twilio service not configured');
  }

  try {
    // Create a voice call with custom TwiML
    const call = await client.calls.create({
      url: twimlUrl,
      to: toPhoneNumber,
      from: twilioPhoneNumber
    });

    logger.info(`Voice call with custom TwiML initiated with SID: ${call.sid}`);
    return call;
  } catch (err) {
    logger.error('Twilio Voice Call Error:', { error: err.message, toPhoneNumber });
    throw err;
  }
};

module.exports = {
  makeVoiceCall,
  makeVoiceCallWithTwiML
};
