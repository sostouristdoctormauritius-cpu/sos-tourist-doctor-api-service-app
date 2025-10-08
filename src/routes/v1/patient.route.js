const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const patientValidation = require('../../validations/patient.validation');
const patientController = require('../../controllers/patient.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Patient
 *   description: Patient user management
 */

// Apply authentication to all patient routes
router.use(auth());

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Create patient user
 *     description: Create a new patient user (admin only)
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user]
 *                 default: user
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               address:
 *                 type: string
 *               emergencyContact:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   relationship:
 *                     type: string
 *               medicalHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     condition:
 *                       type: string
 *                     diagnosisDate:
 *                       type: string
 *                       format: date
 *                     status:
 *                       type: string
 *                       enum: [active, resolved, chronic]
 *                     notes:
 *                       type: string
 *               allergies:
 *                 type: array
 *                 items:
 *                   type: string
 *               currentMedications:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     dosage:
 *                       type: string
 *                     frequency:
 *                       type: string
 *                     prescribedBy:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Patient created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router
  .route('/')
  .post(
    auth('manageUsers'),
    validate(patientValidation.createPatient),
    patientController.createPatient
  )
  .get(
    auth('getUsers'),
    validate(patientValidation.getPatients),
    patientController.getPatients
  );

/**
 * @swagger
 * /patients/{patientId}:
 *   get:
 *     summary: Get patient by ID
 *     description: Retrieve a specific patient by their ID
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Patient retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Patient not found
 */
router
  .route('/:patientId')
  .get(
    auth('getUsers'),
    validate(patientValidation.getPatient),
    patientController.getPatient
  )
  .patch(
    auth('manageUsers'),
    validate(patientValidation.updatePatient),
    patientController.updatePatient
  )
  .delete(
    auth('manageUsers'),
    validate(patientValidation.deletePatient),
    patientController.deletePatient
  );

module.exports = router;
