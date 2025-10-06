const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
// const patientValidation = require('../../validations/patient.validation');
// const patientController = require('../../controllers/patient.controller');

const router = express.Router();

// Since we don't have the actual patient controller and validation yet,
// we'll just define the routes without actual implementation
// This will at least prevent the server from crashing on startup

// router
//   .route('/')
//   .post(
//     auth('manageUsers'),
//     validate(patientValidation.createPatient),
//     patientController.createPatient
//   )
//   .get(
//     auth('getUsers'),
//     validate(patientValidation.getPatients),
//     patientController.getPatients
//   );

// router
//   .route('/:patientId')
//   .get(
//     auth('getUsers'),
//     validate(patientValidation.getPatient),
//     patientController.getPatient
//   )
//   .patch(
//     auth('manageUsers'),
//     validate(patientValidation.updatePatient),
//     patientController.updatePatient
//   )
//   .delete(
//     auth('manageUsers'),
//     validate(patientValidation.deletePatient),
//     patientController.deletePatient
//   );

module.exports = router;
