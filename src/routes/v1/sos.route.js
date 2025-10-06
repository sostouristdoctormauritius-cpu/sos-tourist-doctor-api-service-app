const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const sosController = require('../../controllers/sos.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: SOS
 *   description: Emergency SOS management
 */

// Apply authentication to all SOS routes
router.use(auth());

/**
 * @swagger
 * /sos/emergency:
 *   post:
 *     summary: Create emergency SOS request
 *     description: Create a new emergency SOS request for immediate medical assistance
 *     tags: [SOS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emergencyType
 *               - description
 *               - location
 *             properties:
 *               emergencyType:
 *                 type: string
 *                 enum: [medical, accident, other]
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               location:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   coordinates:
 *                     type: object
 *                     properties:
 *                       lat: { type: number }
 *                       lng: { type: number }
 *                   city: { type: string }
 *                   country: { type: string }
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 default: medium
 *               contactNumber: { type: string }
 *               additionalInfo: { type: string, maxLength: 1000 }
 *     responses:
 *       201:
 *         description: Emergency SOS request created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/emergency', validate(sosValidation.createEmergencyRequest), sosController.createEmergencyRequest);

/**
 * @swagger
 * /sos/history:
 *   get:
 *     summary: Get user's SOS history
 *     description: Retrieve the SOS request history for the authenticated user
 *     tags: [SOS]
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
 *     responses:
 *       200:
 *         description: SOS history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/history', sosController.getSosHistory);

/**
 * @swagger
 * /sos/{sosId}:
 *   get:
 *     summary: Get SOS request by ID
 *     description: Retrieve a specific SOS request by its ID
 *     tags: [SOS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sosId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SOS request retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: SOS request not found
 */
router.get('/:sosId', validate(sosValidation.getSosRequest), sosController.getSosRequest);

/**
 * @swagger
 * /sos/{sosId}/status:
 *   patch:
 *     summary: Update SOS request status
 *     description: Update the status of an SOS request (for doctors/admins)
 *     tags: [SOS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sosId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, assigned, in_progress, resolved, cancelled]
 *               notes: { type: string, maxLength: 500 }
 *               assignedDoctorId: { type: string }
 *               estimatedArrivalTime: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: SOS request status updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: SOS request not found
 */
router.patch('/:sosId/status', validate(sosValidation.updateSosStatus), sosController.updateSosStatus);

/**
 * @swagger
 * /sos/active/requests:
 *   get:
 *     summary: Get active SOS requests
 *     description: Retrieve all active SOS requests (for doctors and admins)
 *     tags: [SOS]
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
 *           default: 20
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Active SOS requests retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get('/active/requests', sosController.getActiveSosRequests);

module.exports = router;
