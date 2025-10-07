const express = require('express');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Public Users
 *   description: Public user data endpoints (no authentication required)
 */

/**
 * @swagger
 * /users/public/doctors:
 *   get:
 *     summary: Get public doctors list
 *     description: Retrieve a list of publicly available doctors
 *     tags: [Public Users]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by doctor name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [doctor]
 *         description: Filter by role (only doctors)
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
 *         description: Doctors retrieved successfully
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
router
  .route('/doctors')
  .get(validate(userValidation.getUsers), userController.getDoctors);

/**
 * @swagger
 * /users/public/clients:
 *   get:
 *     summary: Get public clients list
 *     description: Retrieve a list of public clients (non-doctor users)
 *     tags: [Public Users]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role (excludes doctors)
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
 *         description: Clients retrieved successfully
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
router
  .route('/clients')
  .get(validate(userValidation.getUsers), userController.getUsers);

/**
 * @swagger
 * /users/public/doctors/search:
 *   get:
 *     summary: Search doctors with filters
 *     description: Search and filter doctors by specialization, language, or search terms
 *     tags: [Public Users]
 *     parameters:
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *         description: Filter by medical specialization
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by supported language
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: General search term
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
 *         description: Doctors retrieved successfully
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
router
  .route('/doctors/search')
  .get(validate(userValidation.getDoctorsWithFilters), userController.getDoctorsWithFilters);

/**
 * @swagger
 * /users/public/doctors/{doctorId}:
 *   get:
 *     summary: Get doctor by ID
 *     description: Retrieve detailed information about a specific doctor
 *     tags: [Public Users]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Doctor's unique identifier
 *     responses:
 *       200:
 *         description: Doctor retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: string }
 *                 name: { type: string }
 *                 email: { type: string, format: email, nullable: true }
 *                 phone: { type: string, nullable: true }
 *                 profile_picture: { type: string, nullable: true }
 *                 specialisation: { type: string, nullable: true }
 *                 rating: { type: number, nullable: true }
 *                 rating_count: { type: integer }
 *                 address: { type: string, nullable: true }
 *                 working_hours: { type: string, nullable: true }
 *                 bio: { type: string, nullable: true }
 *                 supported_languages: { type: array, items: { type: string } }
 *                 education: { type: string, nullable: true }
 *                 experience: { type: string, nullable: true }
 *                 certifications: { type: array, items: { type: string } }
 *                 created_at: { type: string, format: date-time }
 *                 updated_at: { type: string, format: date-time }
 *       404:
 *         description: Doctor not found
 */
router
  .route('/doctors/:doctorId')
  .get(validate(userValidation.getDoctorById), userController.getDoctorById);

module.exports = router;