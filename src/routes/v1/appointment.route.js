const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const appointmentValidation = require('../../validations/appointment.validation');
const appointmentController = require('../../controllers/appointment.controller');

const router = express.Router();

// Public routes (no authentication required) - defined first
router
  .route('/public/check-availability/:doctorId')
  .get(
    validate(appointmentValidation.checkAvailability),
    appointmentController.checkAvailability
  );

router
  .route('/public/all')
  .get(
    validate(appointmentValidation.getAllAppointments),
    appointmentController.getPublicAppointments
  );

// Public route to get all appointments for the current month
router
  .route('/public/current-month')
  .get(
    validate(appointmentValidation.getCurrentMonthAppointments),
    appointmentController.getCurrentMonthAppointments
  );

// Admin endpoint to get all appointments
router
  .route('/all')
  .get(
    auth('manageUsers'),
    validate(appointmentValidation.getAllAppointments),
    appointmentController.getAllAppointments
  );

router
  .route('/simple')
  .post(
    validate(appointmentValidation.createAppointment),
    appointmentController.simpleCreateAppointment
  );

// All other routes require authentication
router
  .route('/')
  .post(
    validate(appointmentValidation.createAppointment),
    appointmentController.bookAppointment
  )
  .get(auth(), appointmentController.getAppointments);

router
  .route('/:appointmentId')
  .get(auth(), validate(appointmentValidation.getAppointment), appointmentController.getAppointmentById)
  .patch(auth(), validate(appointmentValidation.updateAppointment), appointmentController.updateAppointmentStatus)
  .delete(auth(), validate(appointmentValidation.deleteAppointment), appointmentController.cancelAppointment);

router
  .route('/doctor/:doctorId/completed')
  .get(auth('manageUsers'), appointmentController.getCompletedAndCancelledAppointments);

router
  .route('/doctor/:doctorId')
  .get(auth('manageUsers'), appointmentController.getUpcomingAppointmentsUnified);

module.exports = router;
