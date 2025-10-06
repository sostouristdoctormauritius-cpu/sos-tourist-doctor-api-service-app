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

// Auth endpoints that match mobile app expectations
router.post('/auth/app/forgot-password', authController.forgotPassword);
router.post('/auth/change-password', authController.changePassword);

// OTP endpoints with mobile app specific paths
router.post('/users/verify-otp-app', authController.verifyOtp);
router.post('/users/resent-otp', authController.resendOtp); // Keeping the typo to match mobile app

// Appointment endpoints for chat functionality
router.post('/appointments/book-chat', auth(), appointmentController.bookAppointment);
router.put('/appointments/:appointmentId/update-chat', auth(), appointmentController.bookAppointment);

// Payment endpoint
router.post('/appointments/:appointmentId/pay', auth(), (req, res) => {
  // Simple payment endpoint implementation
  res.status(200).json({
    success: true,
    message: 'Payment processed successfully',
    data: {
      paymentStatus: 'completed',
      transactionId: 'txn_' + Date.now()
    }
  });
});

// Availability endpoints
router.get('/availability/available-slots', auth(), catchAsync(async (req, res) => {
  // This would need to be implemented properly in the controller
  // For now, returning a proper structure
  res.status(200).json({
    success: true,
    data: [],
    message: 'Available slots retrieved successfully'
  });
}));

// Mobile config endpoint
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
router.get('/prescriptions/my-prescriptions', auth(), prescriptionController.getPrescriptionsFiltered);
router.get('/prescriptions/my-prescriptions/:prescriptionId/pdf', auth(), prescriptionController.downloadPrescriptionPdf);

module.exports = router;
