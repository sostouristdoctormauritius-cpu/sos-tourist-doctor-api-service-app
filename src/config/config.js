const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    PRIMARY_DB: Joi.string().valid('SUPABASE').default('SUPABASE'),
    SUPABASE_URL: Joi.string().required().description('Supabase URL'),
    SUPABASE_SERVICE_ROLE_KEY: Joi.string().required().description('Supabase Service Role Key'),
    SUPABASE_ANON_KEY: Joi.string().required().description('Supabase Anon Key'),
    JWT_SECRET: Joi.string().required().min(32).description('JWT secret key - minimum 32 characters'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),
    USER_INVITATION_EXPIRATION_HOURS: Joi.number().description('user invitation token expiry in hours'),
    USER_DELETION_REQUEST_EXPIRATION_HOURS: Joi.number().description('user deletion token expiry in hours'),
    OTP_EXPIRATION_MINUTES: Joi.number()
      .default(5)
      .description('minutes after which OTP expires'),
    SMTP_HOST: Joi.string().description('SMTP host for email service'),
    SMTP_PORT: Joi.number().description('SMTP port for email service'),
    SMTP_USERNAME: Joi.string().description('username for email server'),
    SMTP_PASSWORD: Joi.string().description('password for email server'),
    EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
    TWILIO_ACCOUNT_SID: Joi.string().description('Twilio Account SID'),
    TWILIO_AUTH_TOKEN: Joi.string().description('Twilio Auth Token'),
    TWILIO_PHONE_NUMBER: Joi.string().description('Twilio Phone Number'),
    TWILIO_WHATSAPP_NUM: Joi.string().description('Twilio WhatsApp Number'),
    STREAM_KEY: Joi.string().description('Stream key'),
    STREAM_SECRET: Joi.string().description('Stream secret'),
    PORTAL_BASE_URL: Joi.string().description('Portal base URL')
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Additional validation for critical security configurations
if (envVars.NODE_ENV === 'production' && envVars.JWT_SECRET === 'super-secret-jwt-token-with-at-least-32-characters-long') {
  throw new Error('Please change the default JWT_SECRET in production environment');
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES
  },
  userInvitationExpiryHours: envVars.USER_INVITATION_EXPIRATION_HOURS,
  userDeletionRequestExpiryHours: envVars.USER_DELETION_REQUEST_EXPIRATION_HOURS,
  otpExpiryMinutes: envVars.OTP_EXPIRATION_MINUTES,
  supabase: {
    url: envVars.SUPABASE_URL,
    serviceRoleKey: envVars.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: envVars.SUPABASE_ANON_KEY
  },

  primaryDb: envVars.PRIMARY_DB,
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD
      }
    },
    from: envVars.EMAIL_FROM
  },

  twilio: {
    accountSid: envVars.TWILIO_ACCOUNT_SID,
    authToken: envVars.TWILIO_AUTH_TOKEN,
    phoneNumber: envVars.TWILIO_PHONE_NUMBER,
    whatsappNumber: envVars.TWILIO_WHATSAPP_NUM
  },



  stream: {
    key: envVars.STREAM_KEY,
    secret: envVars.STREAM_SECRET
  },
  portalBaseUrl: envVars.PORTAL_BASE_URL
};
