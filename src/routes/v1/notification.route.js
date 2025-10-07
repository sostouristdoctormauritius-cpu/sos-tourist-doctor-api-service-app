const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const notificationController = require('../../controllers/notification.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management
 */

// Apply authentication to all notification routes
router.use(auth());

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get user notifications
 *     description: Retrieve notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt:desc
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [info, warning, error, success]
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', notificationController.getNotifications);

/**
 * @swagger
 * /notifications/{notificationId}:
 *   get:
 *     summary: Get notification by ID
 *     description: Retrieve a specific notification by its ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.get('/:notificationId', notificationController.getNotification);

/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.patch('/:notificationId/read', notificationController.markAsRead);

/**
 * @swagger
 * /notifications/mark-all-read:
 *   patch:
 *     summary: Mark all notifications as read
 *     description: Mark all user notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
 *       401:
 *         description: Unauthorized
 */
router.patch('/mark-all-read', notificationController.markAllAsRead);

/**
 * @swagger
 * /notifications/{notificationId}:
 *   delete:
 *     summary: Delete notification
 *     description: Delete a specific notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.delete('/:notificationId', notificationController.deleteNotification);

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     description: Get the count of unread notifications for the user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/unread-count', notificationController.getUnreadCount);

module.exports = router;
