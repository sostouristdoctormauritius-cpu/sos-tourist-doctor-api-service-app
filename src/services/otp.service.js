const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const config = require('../config/config');
const logger = require('../config/logger');
const { getDbClient } = require('../db/dbManager'); // Import Supabase client

/**
 * Generate and send OTP using Supabase's built-in OTP functionality
 * @param {string} contact - The contact (email or phone) for which OTP is generated
 * @param {string} contactType - 'email' or 'phone'
 * @returns {Promise<Object>} - The result of the OTP sending operation
 */
const generateAndStoreOtp = async (contact, contactType) => {
  const supabase = getDbClient();

  // Use Supabase's built-in OTP functionality
  let error;

  if (contactType === 'email') {
    ({ error } = await supabase.auth.signInWithOtp({
      email: contact
    }));
  } else {
    // For phone numbers
    ({ error } = await supabase.auth.signInWithOtp({
      phone: contact
    }));
  }

  if (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to send OTP: ${error.message}`);
  }

  logger.info(`Generated and sent OTP for ${contactType}: ${contact}`);
  return { message: 'OTP sent successfully' };
};

/**
 * Verify OTP using Supabase's built-in OTP functionality
 * @param {string} contact - The contact (email or phone) for which OTP is to be verified
 * @param {string} contactType - 'email' or 'phone'
 * @param {string} otp - The OTP to verify
 * @returns {Promise<Object>} - The result of the OTP verification operation
 */
const verifyOtp = async (contact, contactType, otp) => {
  const supabase = getDbClient();

  try {
    let data, error;

    if (contactType === 'email') {
      // For email, use Supabase's verifyOtp method
      ({ data, error } = await supabase.auth.verifyOtp({
        email: contact,
        token: otp,
        type: 'magiclink'
      }));
    } else {
      // For phone, use Supabase's verifyOtp method
      ({ data, error } = await supabase.auth.verifyOtp({
        phone: contact,
        token: otp,
        type: 'sms'
      }));
    }

    if (error) {
      throw new ApiError(httpStatus.UNAUTHORIZED, `Invalid OTP: ${error.message}`);
    }

    if (!data.user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Failed to authenticate user');
    }

    logger.info(`OTP verified successfully for ${contactType}: ${contact}`);
    return data;
  } catch (error) {
    logger.error(`Error verifying OTP for ${contactType}: ${contact}`, error);
    throw error;
  }
};

module.exports = {
  generateAndStoreOtp,
  verifyOtp
};
