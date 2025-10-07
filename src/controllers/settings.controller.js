const { status } = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { settingsService } = require('../services');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const getProfileSettings = catchAsync(async (req, res) => {
  const userId = req.user.id;

  logger.info('Getting profile settings', { userId });

  const settings = await settingsService.getProfileSettings(userId);

  res.status(status.OK).send({
    settings,
    message: 'Profile settings retrieved successfully'
  });
});

const updateProfileSettings = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const updateData = req.body;

  logger.info('Updating profile settings', { userId, updateData });

  const settings = await settingsService.updateProfileSettings(userId, updateData);

  res.status(status.OK).send({
    settings,
    message: 'Profile settings updated successfully'
  });
});

const getUserPreferences = catchAsync(async (req, res) => {
  const userId = req.user.id;

  logger.info('Getting user preferences', { userId });

  const preferences = await settingsService.getUserPreferences(userId);

  res.status(status.OK).send({
    preferences,
    message: 'User preferences retrieved successfully'
  });
});

const updateUserPreferences = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const updateData = req.body;

  logger.info('Updating user preferences', { userId, updateData });

  const preferences = await settingsService.updateUserPreferences(userId, updateData);

  res.status(status.OK).send({
    preferences,
    message: 'User preferences updated successfully'
  });
});

const getNotificationSettings = catchAsync(async (req, res) => {
  const userId = req.user.id;

  logger.info('Getting notification settings', { userId });

  const settings = await settingsService.getNotificationSettings(userId);

  res.status(status.OK).send({
    settings,
    message: 'Notification settings retrieved successfully'
  });
});

const updateNotificationSettings = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const updateData = req.body;

  logger.info('Updating notification settings', { userId, updateData });

  const settings = await settingsService.updateNotificationSettings(userId, updateData);

  res.status(status.OK).send({
    settings,
    message: 'Notification settings updated successfully'
  });
});

const getSecuritySettings = catchAsync(async (req, res) => {
  const userId = req.user.id;

  logger.info('Getting security settings', { userId });

  const settings = await settingsService.getSecuritySettings(userId);

  res.status(status.OK).send({
    settings,
    message: 'Security settings retrieved successfully'
  });
});

const updateSecuritySettings = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const updateData = req.body;

  logger.info('Updating security settings', { userId, updateData });

  const settings = await settingsService.updateSecuritySettings(userId, updateData);

  res.status(status.OK).send({
    settings,
    message: 'Security settings updated successfully'
  });
});

const getPrivacySettings = catchAsync(async (req, res) => {
  const userId = req.user.id;

  logger.info('Getting privacy settings', { userId });

  const settings = await settingsService.getPrivacySettings(userId);

  res.status(status.OK).send({
    settings,
    message: 'Privacy settings retrieved successfully'
  });
});

const updatePrivacySettings = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const updateData = req.body;

  logger.info('Updating privacy settings', { userId, updateData });

  const settings = await settingsService.updatePrivacySettings(userId, updateData);

  res.status(status.OK).send({
    settings,
    message: 'Privacy settings updated successfully'
  });
});

module.exports = {
  getProfileSettings,
  updateProfileSettings,
  getUserPreferences,
  updateUserPreferences,
  getNotificationSettings,
  updateNotificationSettings,
  getSecuritySettings,
  updateSecuritySettings,
  getPrivacySettings,
  updatePrivacySettings
};
