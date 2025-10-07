const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const settingsController = require('../../controllers/settings.controller');
const settingsValidation = require('../../validations/settings.validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Application settings and configuration management
 */

// Apply authentication to all settings routes
router.use(auth());

/**
 * @swagger
 * /settings/profile:
 *   get:
 *     summary: Get user profile settings
 *     description: Retrieve the current user's profile settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile settings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', settingsController.getProfileSettings);

/**
 * @swagger
 * /settings/profile:
 *   patch:
 *     summary: Update user profile settings
 *     description: Update the current user's profile settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 maxLength: 50
 *               lastName:
 *                 type: string
 *                 maxLength: 50
 *               phone:
 *                 type: string
 *                 pattern: '^\+?[\d\s\-\(\)]+$'
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   country:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *               emergencyContact:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   relationship:
 *                     type: string
 *     responses:
 *       200:
 *         description: Profile settings updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.patch('/profile', validate(settingsValidation.updateProfile), settingsController.updateProfileSettings);

/**
 * @swagger
 * /settings/preferences:
 *   get:
 *     summary: Get user preferences
 *     description: Retrieve the current user's application preferences
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/preferences', settingsController.getUserPreferences);

/**
 * @swagger
 * /settings/preferences:
 *   patch:
 *     summary: Update user preferences
 *     description: Update the current user's application preferences
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 enum: [en, fr, es, de]
 *                 default: en
 *               timezone:
 *                 type: string
 *               theme:
 *                 type: string
 *                 enum: [light, dark, auto]
 *                 default: auto
 *               notifications:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: boolean
 *                     default: true
 *                   sms:
 *                     type: boolean
 *                     default: false
 *                   push:
 *                     type: boolean
 *                     default: true
 *               privacy:
 *                 type: object
 *                 properties:
 *                   profileVisible:
 *                     type: boolean
 *                     default: true
 *                   showOnlineStatus:
 *                     type: boolean
 *                     default: true
 *                   allowDirectMessages:
 *                     type: boolean
 *                     default: true
 *     responses:
 *       200:
 *         description: User preferences updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.patch('/preferences', validate(settingsValidation.updatePreferences), settingsController.updateUserPreferences);

/**
 * @swagger
 * /settings/notifications:
 *   get:
 *     summary: Get notification settings
 *     description: Retrieve the current user's notification settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification settings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/notifications', settingsController.getNotificationSettings);

/**
 * @swagger
 * /settings/notifications:
 *   patch:
 *     summary: Update notification settings
 *     description: Update the current user's notification settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appointmentReminders:
 *                 type: boolean
 *                 default: true
 *               sosAlerts:
 *                 type: boolean
 *                 default: true
 *               newMessages:
 *                 type: boolean
 *                 default: true
 *               promotionalEmails:
 *                 type: boolean
 *                 default: false
 *               systemUpdates:
 *                 type: boolean
 *                 default: true
 *               reminderTiming:
 *                 type: integer
 *                 description: Minutes before appointment for reminder
 *                 minimum: 5
 *                 maximum: 1440
 *                 default: 30
 *     responses:
 *       200:
 *         description: Notification settings updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.patch('/notifications', validate(settingsValidation.updateNotificationSettings), settingsController.updateNotificationSettings);

/**
 * @swagger
 * /settings/security:
 *   get:
 *     summary: Get security settings
 *     description: Retrieve the current user's security settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security settings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/security', settingsController.getSecuritySettings);

/**
 * @swagger
 * /settings/security:
 *   patch:
 *     summary: Update security settings
 *     description: Update the current user's security settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               twoFactorEnabled:
 *                 type: boolean
 *                 default: false
 *               sessionTimeout:
 *                 type: integer
 *                 description: Session timeout in minutes
 *                 minimum: 15
 *                 maximum: 10080
 *                 default: 480
 *               passwordChangeRequired:
 *                 type: boolean
 *                 default: false
 *               loginNotifications:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Security settings updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.patch('/security', validate(settingsValidation.updateSecuritySettings), settingsController.updateSecuritySettings);

/**
 * @swagger
 * /settings/privacy:
 *   get:
 *     summary: Get privacy settings
 *     description: Retrieve the current user's privacy settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Privacy settings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/privacy', settingsController.getPrivacySettings);

/**
 * @swagger
 * /settings/privacy:
 *   patch:
 *     summary: Update privacy settings
 *     description: Update the current user's privacy settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dataSharing:
 *                 type: boolean
 *                 default: false
 *               analyticsOptOut:
 *                 type: boolean
 *                 default: false
 *               thirdPartyIntegrations:
 *                 type: boolean
 *                 default: false
 *               medicalDataSharing:
 *                 type: boolean
 *                 default: false
 *               locationTracking:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       200:
 *         description: Privacy settings updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.patch('/privacy', validate(settingsValidation.updatePrivacySettings), settingsController.updatePrivacySettings);

module.exports = router;
