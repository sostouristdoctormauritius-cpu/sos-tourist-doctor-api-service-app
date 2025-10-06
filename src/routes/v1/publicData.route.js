const express = require('express');
const userController = require('../../controllers/user.controller');
const doctorController = require('../../controllers/doctor.controller');
const appointmentController = require('../../controllers/appointment.controller');

const router = express.Router();

// Public data endpoints - no auth required
router.get('/data/clients', userController.getClients);
router.get('/data/doctors', doctorController.getDoctors);
router.get('/data/appointments', appointmentController.getPublicAppointments);

module.exports = router;
