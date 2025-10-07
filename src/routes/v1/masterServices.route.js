const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const masterServicesController = require('../../controllers/masterServices.controller');
const masterServicesValidation = require('../../validations/masterServices.validation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Master Services
 *   description: Master services and configuration management
 */

// Apply authentication to all master services routes
router.use(auth());

/**
 * @swagger
 * /master-services:
 *   get:
 *     summary: Get all master services
 *     description: Retrieve all available master services
 *     tags: [Master Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: name:asc
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Master services retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', masterServicesController.getAllServices);

/**
 * @swagger
 * /master-services/{serviceId}:
 *   get:
 *     summary: Get master service by ID
 *     description: Retrieve a specific master service by its ID
 *     tags: [Master Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Master service retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Master service not found
 */
router.get('/:serviceId', masterServicesController.getServiceById);

/**
 * @swagger
 * /master-services:
 *   post:
 *     summary: Create master service
 *     description: Create a new master service
 *     tags: [Master Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               category:
 *                 type: string
 *                 maxLength: 50
 *               price:
 *                 type: number
 *                 minimum: 0
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *                 minimum: 1
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               imageUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Master service created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/', validate(masterServicesValidation.createService), masterServicesController.createService);

/**
 * @swagger
 * /master-services/{serviceId}:
 *   patch:
 *     summary: Update master service
 *     description: Update an existing master service
 *     tags: [Master Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               category:
 *                 type: string
 *                 maxLength: 50
 *               price:
 *                 type: number
 *                 minimum: 0
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *                 minimum: 1
 *               isActive:
 *                 type: boolean
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Master service updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Master service not found
 */
router.patch('/:serviceId', validate(masterServicesValidation.updateService), masterServicesController.updateService);

/**
 * @swagger
 * /master-services/{serviceId}:
 *   delete:
 *     summary: Delete master service
 *     description: Delete a master service
 *     tags: [Master Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Master service deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Master service not found
 */
router.delete('/:serviceId', masterServicesController.deleteService);

/**
 * @swagger
 * /master-services/categories:
 *   get:
 *     summary: Get service categories
 *     description: Retrieve all available service categories
 *     tags: [Master Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Service categories retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/categories', masterServicesController.getServiceCategories);

module.exports = router;
