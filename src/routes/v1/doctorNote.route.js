const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const doctorNoteValidation = require('../../validations/doctorNote.validation');
const doctorNoteController = require('../../controllers/doctorNote.controller');

const router = express.Router();

router
  .route('/')
  .post(
    validate(doctorNoteValidation.createDoctorNote),
    doctorNoteController.createDoctorNote
  )
  .get(
    validate(doctorNoteValidation.getDoctorNotes),
    doctorNoteController.getDoctorNotes
  );

router
  .route('/:doctorNoteId')
  .get(
    validate(doctorNoteValidation.getDoctorNote),
    doctorNoteController.getDoctorNote
  )
  .patch(
    validate(doctorNoteValidation.updateDoctorNote),
    doctorNoteController.updateDoctorNote
  )
  .delete(
    validate(doctorNoteValidation.deleteDoctorNote),
    doctorNoteController.deleteDoctorNote
  );

// Patient-specific routes
router
  .route('/patient/:patientId')
  .get(
    validate(doctorNoteValidation.getDoctorNotesByPatient),
    doctorNoteController.getDoctorNotesByPatient
  );

// Appointment-specific routes
router
  .route('/appointment/:appointmentId')
  .get(
    validate(doctorNoteValidation.getDoctorNoteByAppointment),
    doctorNoteController.getDoctorNoteByAppointment
  );

module.exports = router;
