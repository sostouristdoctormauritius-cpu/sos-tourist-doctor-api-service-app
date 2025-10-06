const express = require('express');
const path = require('path');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const doctorValidation = require('../../validations/doctor.validation');
const doctorController = require('../../controllers/doctor.controller');

const router = express.Router();

// Public endpoint to get all doctors
router
  .route('/public/all')
  .get(
    validate(doctorValidation.getDoctors),
    doctorController.getDoctors
  );

router
  .route('/')
  .post(auth('manageDoctors'), validate(doctorValidation.createDoctor), doctorController.createDoctor)
  .get(auth('getDoctors'), validate(doctorValidation.getDoctors), doctorController.getDoctors);

router
  .route('/:doctorId')
  .get(auth('getDoctors'), validate(doctorValidation.getDoctor), doctorController.getDoctor)
  .patch(auth('manageDoctors'), validate(doctorValidation.updateDoctor), doctorController.updateDoctor)
  .delete(auth('manageDoctors'), validate(doctorValidation.deleteDoctor), doctorController.deleteDoctor);

// New routes for comprehensive doctor management
router
  .route('/admin/all')
  .get(auth('manageDoctors'), doctorController.getAllDoctors);

router
  .route('/admin/stats')
  .get(auth('manageDoctors'), doctorController.getDoctorStats);

router
  .route('/:doctorId/listing')
  .patch(auth('manageDoctors'), validate(doctorValidation.toggleDoctorListing), doctorController.toggleDoctorListing);

// Route to serve the doctor management page
router.get('/management', auth('manageDoctors'), (req, res) => {
  res.sendFile(path.join(__dirname, '../../../public/doctorManagement.html'));
});

module.exports = router;
