const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const prescriptionValidation = require('../../validations/prescription.validation');
const prescriptionController = require('../../controllers/prescription.controller');

const router = express.Router();

router
  .route('/')
  .post(
    validate(prescriptionValidation.createPrescription),
    prescriptionController.createPrescription
  )
  .get(
    validate(prescriptionValidation.getPrescriptions),
    prescriptionController.getPrescriptions
  );

router
  .route('/:prescriptionId')
  .get(
    validate(prescriptionValidation.getPrescription),
    prescriptionController.getPrescription
  )
  .patch(
    validate(prescriptionValidation.updatePrescription),
    prescriptionController.updatePrescription
  )
  .delete(
    validate(prescriptionValidation.deletePrescription),
    prescriptionController.deletePrescription
  );





// Appointment-specific routes
router
  .route('/appointment/:appointmentId')
  .get(
    validate(prescriptionValidation.getPrescriptionByAppointment),
    prescriptionController.getPrescriptionByAppointment
  );

// Consolidated patient/doctor specific routes
router
  .route('/:role/:userId')
  .get(
    validate(prescriptionValidation.getPrescriptionsFiltered), // Assuming a validation schema for this
    prescriptionController.getPrescriptionsFiltered
  );

module.exports = router;
