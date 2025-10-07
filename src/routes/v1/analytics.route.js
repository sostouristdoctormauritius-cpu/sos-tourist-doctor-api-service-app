const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const analyticsController = require('../../controllers/analytics.controller');
const analyticsValidation = require('../../validations/analytics.validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics and reporting management
 */

// Apply authentication to all analytics routes
router.use(auth());

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Get dashboard analytics
 *     description: Retrieve analytics data for the dashboard
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, quarter, year]
 *           default: month
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Dashboard analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', analyticsController.getDashboardAnalytics);

/**
 * @swagger
 * /analytics/appointments:
 *   get:
 *     summary: Get appointment analytics
 *     description: Retrieve analytics data for appointments
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, quarter, year]
 *           default: month
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/appointments', analyticsController.getAppointmentAnalytics);

/**
 * @swagger
 * /analytics/users:
 *   get:
 *     summary: Get user analytics
 *     description: Retrieve analytics data for users
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, quarter, year]
 *           default: month
 *       - in: query
 *         name: userType
 *         schema:
 *           type: string
 *           enum: [patient, doctor, admin]
 *     responses:
 *       200:
 *         description: User analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/users', analyticsController.getUserAnalytics);

/**
 * @swagger
 * /analytics/sos:
 *   get:
 *     summary: Get SOS analytics
 *     description: Retrieve analytics data for SOS requests
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, quarter, year]
 *           default: month
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, assigned, in_progress, resolved, cancelled]
 *     responses:
 *       200:
 *         description: SOS analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/sos', analyticsController.getSosAnalytics);

/**
 * @swagger
 * /analytics/revenue:
 *   get:
 *     summary: Get revenue analytics
 *     description: Retrieve revenue and financial analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, quarter, year]
 *           default: month
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *     responses:
 *       200:
 *         description: Revenue analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/revenue', analyticsController.getRevenueAnalytics);

/**
 * @swagger
 * /analytics/export:
 *   post:
 *     summary: Export analytics data
 *     description: Export analytics data in various formats
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportType
 *               - format
 *             properties:
 *               reportType:
 *                 type: string
 *                 enum: [dashboard, appointments, users, sos, revenue]
 *               format:
 *                 type: string
 *                 enum: [csv, excel, pdf]
 *               period:
 *                 type: string
 *                 enum: [today, week, month, quarter, year]
 *               filters:
 *                 type: object
 *                 additionalProperties: true
 *     responses:
 *       200:
 *         description: Analytics data exported successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/export', validate(analyticsValidation.exportData), analyticsController.exportAnalytics);

module.exports = router;
