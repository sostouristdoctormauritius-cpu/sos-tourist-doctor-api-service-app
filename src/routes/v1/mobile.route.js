const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const authController = require('../../controllers/auth.controller');
const userController = require('../../controllers/user.controller');
const appointmentController = require('../../controllers/appointment.controller');
const prescriptionController = require('../../controllers/prescription.controller');
const appConfigController = require('../../controllers/appConfig.controller');
const catchAsync = require('../../utils/catchAsync');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Mobile
 *   description: Mobile application specific endpoints
 */

// Auth endpoints that match mobile app expectations
/**
 * @swagger
 * /mobile/auth/app/forgot-password:
 *   post:
 *     summary: Forgot password for mobile app
 *     description: Send password reset OTP to user's email or phone
 *     tags: [Mobile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Password reset OTP sent successfully
 *       400:
 *         description: Invalid email format
 */
router.post('/auth/app/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /mobile/auth/change-password:
 *   post:
 *     summary: Change password for mobile app
 *     description: Change user password after OTP verification
 *     tags: [Mobile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword: { type: string, minLength: 8 }
 *               newPassword: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid password format or current password incorrect
 *       401:
 *         description: Unauthorized
 */
router.post('/auth/change-password', authController.changePassword);

// OTP endpoints with mobile app specific paths
/**
 * @swagger
 * /mobile/users/verify-otp-app:
 *   post:
 *     summary: Verify OTP for mobile app
 *     description: Verify OTP sent to user's email or phone for mobile app authentication
 *     tags: [Mobile]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *               - email
 *             properties:
 *               otp: { type: string, minLength: 4, maxLength: 6 }
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP or email
 *       404:
 *         description: User not found
 */
router.post('/users/verify-otp-app', authController.verifyOtp);

/**
 * @swagger
 * /mobile/users/resent-otp:
 *   post:
 *     summary: Resend OTP for mobile app
 *     description: Resend OTP to user's email or phone for mobile app authentication
 *     tags: [Mobile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string }
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/users/resent-otp', authController.resendOtp); // Keeping the typo to match mobile app

// Appointment endpoints for chat functionality
/**
 * @swagger
 * /mobile/appointments/book-chat:
 *   post:
 *     summary: Book chat appointment
 *     description: Book a chat-based appointment for mobile users
 *     tags: [Mobile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctorId
 *               - appointmentDate
 *               - consultationType
 *             properties:
 *               doctorId: { type: string }
 *               appointmentDate: { type: string, format: date-time }
 *               consultationType: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Chat appointment booked successfully
 *       400:
 *         description: Invalid appointment data
 *       401:
 *         description: Unauthorized
 */
router.post('/appointments/book-chat', auth(), appointmentController.bookAppointment);

/**
 * @swagger
 * /mobile/appointments/{appointmentId}/update-chat:
 *   put:
 *     summary: Update chat appointment
 *     description: Update an existing chat appointment
 *     tags: [Mobile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
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
 *               appointmentDate: { type: string, format: date-time }
 *               notes: { type: string }
 *               status: { type: string }
 *     responses:
 *       200:
 *         description: Chat appointment updated successfully
 *       400:
 *         description: Invalid update data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 */
router.put('/appointments/:appointmentId/update-chat', auth(), appointmentController.bookAppointment);

// Payment endpoint
/**
 * @swagger
 * /mobile/appointments/{appointmentId}/pay:
 *   post:
 *     summary: Process appointment payment
 *     description: Process payment for an appointment via mobile app
 *     tags: [Mobile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
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
 *               - paymentMethod
 *               - amount
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [card, paypal, bank_transfer]
 *               amount: { type: number, minimum: 0 }
 *               currency: { type: string, default: USD }
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *       400:
 *         description: Invalid payment data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Appointment not found
 */
router.post('/appointments/:appointmentId/pay', auth(), appointmentController.processPayment);

// Availability endpoints
/**
 * @swagger
 * /mobile/availability/available-slots:
 *   get:
 *     summary: Get available appointment slots
 *     description: Retrieve available appointment slots for a specific doctor and date
 *     tags: [Mobile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Available slots retrieved successfully
 *       400:
 *         description: Missing doctor ID or date
 *       401:
 *         description: Unauthorized
 */
router.get('/availability/available-slots', auth(), appointmentController.getAvailableSlots);

// Mobile config endpoint
/**
 * @swagger
 * /mobile/config/MOBILE_CONFIG_V1:
 *   get:
 *     summary: Get mobile app configuration
 *     description: Retrieve configuration settings for the mobile application
 *     tags: [Mobile]
 *     responses:
 *       200:
 *         description: Mobile configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     emergency_contacts: { type: array }
 *                     consultations: { type: array }
 *                 message: { type: string }
 */
router.get('/config/MOBILE_CONFIG_V1', catchAsync(async (req, res) => {
  // Return mobile configuration
  res.status(200).json({
    success: true,
    data: {
      emergency_contacts: [],
      consultations: []
    },
    message: 'Mobile configuration retrieved successfully'
  });
}));

// Prescription endpoints for mobile app
/**
 * @swagger
 * /mobile/prescriptions/my-prescriptions:
 *   get:
 *     summary: Get user's prescriptions
 *     description: Retrieve all prescriptions for the authenticated user
 *     tags: [Mobile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Prescriptions retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/prescriptions/my-prescriptions', auth(), prescriptionController.getPrescriptionsFiltered);

/**
 * @swagger
 * /mobile/prescriptions/my-prescriptions/{prescriptionId}/pdf:
 *   get:
 *     summary: Download prescription PDF
 *     description: Download a prescription as PDF file
 *     tags: [Mobile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prescriptionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prescription PDF downloaded successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Prescription not found
 */
router.get('/prescriptions/my-prescriptions/:prescriptionId/pdf', auth(), prescriptionController.downloadPrescriptionPdf);

module.exports = router;
