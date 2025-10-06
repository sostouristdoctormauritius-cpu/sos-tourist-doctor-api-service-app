const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Define validation schema for environment variables
const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .default('development'),
    PORT: Joi.number().default(3000),
    VERSION: Joi.string().default('1.0.0'),
    // JWT
    JWT_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
      .default(30)
      .description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
      .default(30)
      .description('days after which refresh tokens expire'),

    // Supabase
    SUPABASE_URL: Joi.string().required(),
    SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
    SUPABASE_ANON_KEY: Joi.string().required(),

    // Twilio
    TWILIO_ACCOUNT_SID: Joi.string().required(),
    TWILIO_AUTH_TOKEN: Joi.string().required(),

    // Email
    EMAIL_HOST: Joi.string().required(),
    EMAIL_PORT: Joi.number().default(587),
    EMAIL_USERNAME: Joi.string().required(),
    EMAIL_PASSWORD: Joi.string().required(),

    // CORS
    ALLOWED_ORIGINS: Joi.string(),

    // Rate limiting
    RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000), // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100), // limit each IP to 100 requests per windowMs

    // Stream Chat
    STREAM_KEY: Joi.string().required(),
    STREAM_SECRET: Joi.string().required()
  })
  .unknown();

// Validate environment variables
const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Export configuration
module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  version: envVars.VERSION,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
  },
  primaryDb: 'SUPABASE',
  supabase: {
    url: envVars.SUPABASE_URL,
    serviceRoleKey: envVars.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: envVars.SUPABASE_ANON_KEY
  },
  twilio: {
    accountSid: envVars.TWILIO_ACCOUNT_SID,
    authToken: envVars.TWILIO_AUTH_TOKEN
  },
  email: {
    host: envVars.EMAIL_HOST,
    port: envVars.EMAIL_PORT,
    username: envVars.EMAIL_USERNAME,
    password: envVars.EMAIL_PASSWORD,
    from: envVars.EMAIL_USERNAME
  },
  portal: {
    baseUrl: process.env.PORTAL_BASE_URL || 'http://localhost:3000'
  },
  otpExpiryMinutes: 10,
  userInvitationExpiryHours: 24,
  userDeletionRequestExpiryHours: 24,
  cors: {
    allowedOrigins: envVars.ALLOWED_ORIGINS ? envVars.ALLOWED_ORIGINS.split(',') : []
  },
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    max: envVars.RATE_LIMIT_MAX_REQUESTS
  },
  stream: {
    key: envVars.STREAM_KEY,
    secret: envVars.STREAM_SECRET
  }
};
