const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const realtimeValidation = require('../../validations/realtime.validation');
const realtimeController = require('../../controllers/realtime.controller');

const router = express.Router();

router.route('/status').get(realtimeController.getStatus);
router
  .route('/broadcast')
  .post(
    validate(realtimeValidation.broadcastMessage),
    realtimeController.broadcastMessage
  );

module.exports = router;
