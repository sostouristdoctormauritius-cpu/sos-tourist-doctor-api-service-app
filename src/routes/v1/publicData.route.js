const express = require('express');
const userController = require('../../controllers/user.controller');
const doctorController = require('../../controllers/doctor.controller');
const appointmentController = require('../../controllers/appointment.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Public Data
 *   description: Public data endpoints for dashboard and external access
 */

/**
 * @swagger
 * /public/data/clients:
 *   get:
 *     summary: Get public clients data
 *     description: Retrieve public client data for dashboard display
 *     tags: [Public Data]
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
 *         description: Public clients data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 page: { type: integer }
 *                 limit: { type: integer }
 *                 totalPages: { type: integer }
 *                 totalResults: { type: integer }
 */
router.get('/data/clients', userController.getClients);

/**
 * @swagger
 * /public/data/doctors:
 *   get:
 *     summary: Get public doctors data
 *     description: Retrieve public doctor data for dashboard display
 *     tags: [Public Data]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by doctor name
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Filter by specialization
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
 *         description: Public doctors data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 page: { type: integer }
 *                 limit: { type: integer }
 *                 totalPages: { type: integer }
 *                 totalResults: { type: integer }
 */
router.get('/data/doctors', doctorController.getDoctors);

/**
 * @swagger
 * /public/data/appointments:
 *   get:
 *     summary: Get public appointments data
 *     description: Retrieve public appointment data for dashboard display
 *     tags: [Public Data]
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
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter appointments from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter appointments until this date
 *     responses:
 *       200:
 *         description: Public appointments data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: string }
 *                       appointmentDate: { type: string, format: date-time }
 *                       status: { type: string }
 *                       consultationType: { type: string }
 *                       doctorName: { type: string }
 *                       patientName: { type: string }
 *                 page: { type: integer }
 *                 limit: { type: integer }
 *                 totalPages: { type: integer }
 *                 totalResults: { type: integer }
 */
router.get('/data/appointments', appointmentController.getPublicAppointments);

module.exports = router;
