const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const upload = require('../../middlewares/upload.js');
const uploads = require('../../middlewares/uploadMedia');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');
const verifyTempToken = require('../../middlewares/tempAuth.middleware');

const router = express.Router();

router
  .route('/me')
  .get(
    /**
     * @swagger
     * /users/me:
     *   get:
     *     summary: Get current user's information
     *     description: Retrieve information about the currently authenticated user
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       "200":
     *         description: Current user's information
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: string
     *                 name:
     *                   type: string
     *                 email:
     *                   type: string
     *                   format: email
     *                 role:
     *                   type: string
     *                   enum: [user, admin]
     *                 createdAt:
     *                   type: string
     *                   format: date-time
     *                 updatedAt:
     *                   type: string
     *                   format: date-time
     *       "401":
     *         $ref: '#/components/responses/Unauthorized'
     */
    userController.getMe
  );

// Keep only the enhanced doctors route with filtering capabilities
router
  .route('/doctors/search')
  .get(validate(userValidation.getDoctorsWithFilters), userController.getDoctorsWithFilters);

// Keep the get doctor by ID route
router
  .route('/doctors/:doctorId')
  .get(validate(userValidation.getDoctorById), userController.getDoctorById);

router
  .route('/current')
  .get(validate(userValidation.getCurrentUser), userController.getCurrentUser)
  .patch(validate(userValidation.updateCurrentUser), uploads('user').single('profilePicture'), userController.updateCurrentUser)
  .delete(userController.deleteCurrentUser);

router
  .route('/current/profilePicture/upload')
  .post(validate(userValidation.uploadProfilePicture), upload.single('profilePicture'), userController.uploadProfilePicture);

router
  .route('/doctors')
  .get(validate(userValidation.getUsers), userController.getDoctors);

// Changed from /admin to / to make endpoints directly under /users
router
  .route('/')
  .post(auth('manageUsers'), validate(userValidation.createUser), userController.createUser)
  .get(auth('getUsers'), validate(userValidation.getUsers), userController.getUsers)
  .get(validate(userValidation.getUsers), userController.getUsers); // Public users list endpoint

router
  .route('/:userId')
  .get(auth('getUsers'), validate(userValidation.getUser), userController.getUser)
  .patch(auth('manageUsers'), validate(userValidation.updateUser), userController.updateUser)
  .delete(auth('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser);

// User invitation routes
router.route('/invite').post(auth('manageUsers'), userController.sendInvitation);
router.route('/register-invited').post(validate(userValidation.registerInvited), userController.registerInvitedUser);

router.post('/request-deletion', userController.requestDeletion);
router.post('/complete-deletion', userController.completeUserDeletion);
router.post('/verify-deletion-otp', verifyTempToken, userController.verifyOtp);
router.post('/resend-otp', verifyTempToken, userController.resendOtp);

/**
 * @swagger
 * /users/verify-otp:
 *   post:
 *     summary: Verify OTP for user registration or email verification
 *     description: Verify OTP sent to user's email address
 *     tags: [Users]
 *     security:
 *       - tempAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 description: 6-digit numeric OTP
 *             example:
 *               otp: "123456"
 *     responses:
 *       "200":
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated session
 *       "400":
 *         description: Invalid OTP format or expired OTP
 *       "401":
 *         description: Invalid or incorrect OTP
 */

/**
 * @swagger
 * /users/resend-otp:
 *   post:
 *     summary: Resend OTP for user registration or email verification
 *     description: Resend OTP to user's email address if previous one expired
 *     tags: [Users]
 *     security:
 *       - tempAuth: []
 *     responses:
 *       "200":
 *         description: OTP resent successfully
 *       "400":
 *         description: Too many requests - please wait before trying again
 *       "401":
 *         description: Invalid temporary token
 */


/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and retrieval
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a user
 *     description: Only admins can create other users.
 *     tags: [Users]
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
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               role:
 *                  type: string
 *                  enum: [user, admin]
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *               role: user
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all users
 *     description: Only admins can retrieve all users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: User name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: User role
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of users
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user
 *     description: Logged in users can fetch only their own user information. Only admins can fetch other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a user
 *     description: Logged in users can only update their own information. Only admins can update other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a user
 *     description: Logged in users can delete only themselves. Only admins can delete other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
module.exports = router;
