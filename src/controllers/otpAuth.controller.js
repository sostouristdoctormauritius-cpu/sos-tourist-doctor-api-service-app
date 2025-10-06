const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const userService = require('../services/user.service');
const tokenService = require('../services/token.service');
const otpService = require('../services/otp.service');
const ApiError = require('../utils/ApiError');
const { validateOtpRequest } = require('../utils/validation');
const config = require('../config/config');
const dbManager = require('../db/dbManager');
const twilio = require('twilio');

// Initialize Supabase client for Auth operations
const supabase = dbManager.getDbClient();

// Initialize Twilio client if credentials are available
let twilioClient;
if (config.twilio && config.twilio.accountSid && config.twilio.authToken) {
  twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);
}

/**
 * Send OTP via Supabase's built-in OTP functionality
 */
const sendOtp = catchAsync(async (req, res) => {
  const { contact, contactType, deliveryMethod } = req.body;

  if (!contact || !contactType || !deliveryMethod) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Contact, contactType, and deliveryMethod are required');
  }

  validateOtpRequest(contactType, deliveryMethod);

  // For email delivery, use Supabase OTP
  if (deliveryMethod === 'email') {
    const result = await otpService.generateAndStoreOtp(contact, contactType);
    return res.status(httpStatus.OK).send(result);
  }

  // For SMS/WhatsApp delivery, use Twilio if configured
  if ((deliveryMethod === 'sms' || deliveryMethod === 'whatsapp') && !twilioClient) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Twilio not configured for SMS/WhatsApp delivery');
  }

  // For phone numbers, generate and send OTP using Twilio
  const otpResult = await otpService.generateAndStoreOtp(contact, contactType);

  try {
    if (deliveryMethod === 'sms') {
      await twilioClient.messages.create({
        body: 'Your OTP code is being processed via Supabase',
        from: config.twilio.phoneNumber,
        to: contact
      });
    } else if (deliveryMethod === 'whatsapp') {
      await twilioClient.messages.create({
        body: 'Your OTP code is being processed via Supabase',
        from: `whatsapp:${config.twilio.whatsappNumber}`,
        to: `whatsapp:${contact}`
      });
    }

    res.status(httpStatus.OK).send({
      message: `OTP sent successfully via ${deliveryMethod}`
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to send OTP via ${deliveryMethod}: ${error.message}`);
  }
});

/**
 * Verify OTP
 */
const verifyOtp = catchAsync(async (req, res) => {
  const { contact, contactType, deliveryMethod, otp } = req.body;

  if (!contact || !contactType || !deliveryMethod || !otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Contact, contactType, deliveryMethod, and OTP are required');
  }

  validateOtpRequest(contactType, deliveryMethod);

  // Use the updated OTP service that leverages Supabase's built-in OTP functionality
  const data = await otpService.verifyOtp(contact, contactType, otp);

  // Get user from our database
  let user;
  if (contactType === 'email') {
    user = await userService.getUserByEmail(contact);
  } else {
    user = await userService.getUserByPhone(contact);
  }

  if (!user) {
    // If user doesn't exist, throw an error. User creation should be a separate step.
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found. Please register first.');
  }

  // Generate tokens
  const tokens = await tokenService.generateAuthTokens(user);

  res.status(httpStatus.OK).send({
    message: 'Login successful',
    user,
    tokens
  });
});

module.exports = {
  sendOtp,
  verifyOtp
};
