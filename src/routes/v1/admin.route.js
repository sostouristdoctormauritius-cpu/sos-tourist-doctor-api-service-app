const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const adminValidation = require('../../validations/admin.validation');
const adminController = require('../../controllers/admin.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin user management
 */

// Apply authentication to all admin routes
router.use(auth());

/**
 * @swagger
 * /admin:
 *   post:
 *     summary: Create admin user
 *     description: Create a new admin user (super admin only)
 *     tags: [Admin]
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
 *                 enum: [admin, super_admin]
 *                 default: admin
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router
  .route('/')
  .post(
    auth('manageUsers'),
    validate(adminValidation.createAdmin),
    adminController.createAdmin
  )
  .get(
    auth('getUsers'),
    validate(adminValidation.getAdmins),
    adminController.getAdmins
  );

/**
 * @swagger
 * /admin/{adminId}:
 *   get:
 *     summary: Get admin by ID
 *     description: Retrieve a specific admin by their ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Admin not found
 */
router
  .route('/:adminId')
  .get(
    auth('getUsers'),
    validate(adminValidation.getAdmin),
    adminController.getAdmin
  )
  .patch(
    auth('manageUsers'),
    validate(adminValidation.updateAdmin),
    adminController.updateAdmin
  )
  .delete(
    auth('manageUsers'),
    validate(adminValidation.deleteAdmin),
    adminController.deleteAdmin
  );

module.exports = router;
