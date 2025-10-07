const Joi = require('joi');

const updateProfile = {
  body: Joi.object().keys({
    firstName: Joi.string().max(50).optional(),
    lastName: Joi.string().max(50).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    dateOfBirth: Joi.date().optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    address: Joi.object().keys({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      postalCode: Joi.string().optional()
    }).optional(),
    emergencyContact: Joi.object().keys({
      name: Joi.string().optional(),
      phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
      relationship: Joi.string().optional()
    }).optional()
  })
};

const updatePreferences = {
  body: Joi.object().keys({
    language: Joi.string().valid('en', 'fr', 'es', 'de').default('en'),
    timezone: Joi.string().optional(),
    theme: Joi.string().valid('light', 'dark', 'auto').default('auto'),
    notifications: Joi.object().keys({
      email: Joi.boolean().default(true),
      sms: Joi.boolean().default(false),
      push: Joi.boolean().default(true)
    }).optional(),
    privacy: Joi.object().keys({
      profileVisible: Joi.boolean().default(true),
      showOnlineStatus: Joi.boolean().default(true),
      allowDirectMessages: Joi.boolean().default(true)
    }).optional()
  })
};

const updateNotificationSettings = {
  body: Joi.object().keys({
    appointmentReminders: Joi.boolean().default(true),
    sosAlerts: Joi.boolean().default(true),
    newMessages: Joi.boolean().default(true),
    promotionalEmails: Joi.boolean().default(false),
    systemUpdates: Joi.boolean().default(true),
    reminderTiming: Joi.number().integer().min(5).max(1440).default(30)
  })
};

const updateSecuritySettings = {
  body: Joi.object().keys({
    twoFactorEnabled: Joi.boolean().default(false),
    sessionTimeout: Joi.number().integer().min(15).max(10080).default(480),
    passwordChangeRequired: Joi.boolean().default(false),
    loginNotifications: Joi.boolean().default(true)
  })
};

const updatePrivacySettings = {
  body: Joi.object().keys({
    dataSharing: Joi.boolean().default(false),
    analyticsOptOut: Joi.boolean().default(false),
    thirdPartyIntegrations: Joi.boolean().default(false),
    medicalDataSharing: Joi.boolean().default(false),
    locationTracking: Joi.boolean().default(true)
  })
};

module.exports = {
  updateProfile,
  updatePreferences,
  updateNotificationSettings,
  updateSecuritySettings,
  updatePrivacySettings
};
