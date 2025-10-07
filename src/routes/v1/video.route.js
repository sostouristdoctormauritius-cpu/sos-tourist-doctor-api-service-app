const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const videoController = require('../../controllers/video.controller');
const videoValidation = require('../../validations/video.validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Video
 *   description: Video calling and streaming management
 */

// Apply authentication to all video routes
router.use(auth());

/**
 * @swagger
 * /video/call:
 *   post:
 *     summary: Initiate video call
 *     description: Start a new video call session
 *     tags: [Video]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - callType
 *             properties:
 *               recipientId:
 *                 type: string
 *                 description: ID of the user to call
 *               callType:
 *                 type: string
 *                 enum: [audio, video]
 *                 default: video
 *               appointmentId:
 *                 type: string
 *                 description: Associated appointment ID if applicable
 *     responses:
 *       201:
 *         description: Video call initiated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/call', validate(videoValidation.initiateCall), videoController.initiateCall);

/**
 * @swagger
 * /video/call/{callId}/answer:
 *   post:
 *     summary: Answer video call
 *     description: Accept an incoming video call
 *     tags: [Video]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: callId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video call answered successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Call not found
 */
router.post('/call/:callId/answer', videoController.answerCall);

/**
 * @swagger
 * /video/call/{callId}/end:
 *   post:
 *     summary: End video call
 *     description: Terminate an ongoing video call
 *     tags: [Video]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: callId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video call ended successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Call not found
 */
router.post('/call/:callId/end', videoController.endCall);

/**
 * @swagger
 * /video/call/{callId}/status:
 *   get:
 *     summary: Get call status
 *     description: Get the current status of a video call
 *     tags: [Video]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: callId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Call status retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Call not found
 */
router.get('/call/:callId/status', videoController.getCallStatus);

/**
 * @swagger
 * /video/calls/history:
 *   get:
 *     summary: Get call history
 *     description: Retrieve video call history for the user
 *     tags: [Video]
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
 *       - in: query
 *         name: callType
 *         schema:
 *           type: string
 *           enum: [audio, video]
 *     responses:
 *       200:
 *         description: Call history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/calls/history', videoController.getCallHistory);

/**
 * @swagger
 * /video/token:
 *   post:
 *     summary: Generate video token
 *     description: Generate a token for video streaming services
 *     tags: [Video]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomName
 *             properties:
 *               roomName:
 *                 type: string
 *                 description: Name of the video room/channel
 *               userIdentity:
 *                 type: string
 *                 description: Identity of the user in the call
 *     responses:
 *       200:
 *         description: Video token generated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/token', validate(videoValidation.generateToken), videoController.generateToken);

module.exports = router;
