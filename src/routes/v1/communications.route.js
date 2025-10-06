const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const communicationsController = require('../../controllers/communications.controller');

const router = express.Router();

router.route('/initiate-call').post(auth(), communicationsController.initiateCall);
router.route('/end-call').post(auth(), communicationsController.endCall);
router.route('/send-message').post(auth(), communicationsController.sendMessage);
router.route('/history/:patientId').get(auth(), communicationsController.getCommunicationHistory);

module.exports = router;
