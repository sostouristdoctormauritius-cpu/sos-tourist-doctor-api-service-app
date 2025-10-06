const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const availabilityValidation = require('../../validations/availability.validation');
const availabilityController = require('../../controllers/availability.controller');

const router = express.Router();

router
  .route('/')
  .post(
    validate(availabilityValidation.createAvailability),
    availabilityController.createAvailability
  )
  .get(
    validate(availabilityValidation.getAvailabilities),
    availabilityController.getAvailabilities
  );

router
  .route('/:availabilityId')
  .get(
    validate(availabilityValidation.getAvailability),
    availabilityController.getAvailability
  )
  .patch(
    validate(availabilityValidation.updateAvailability),
    availabilityController.updateAvailability
  )
  .delete(
    validate(availabilityValidation.deleteAvailability),
    availabilityController.deleteAvailability
  );

// Doctor-specific routes
router
  .route('/doctor/:doctorId')
  .get(
    validate(availabilityValidation.getAvailabilitiesByDoctor),
    availabilityController.getAvailabilitiesByDoctor
  );

module.exports = router;
