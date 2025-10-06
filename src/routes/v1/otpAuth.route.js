const express = require('express');
const validate = require('../../middlewares/validate');
const otpAuthValidation = require('../../validations/otpAuth.validation');
const otpAuthController = require('../../controllers/otpAuth.controller');

const router = express.Router();

router.route('/send').post(validate(otpAuthValidation.sendOtp), otpAuthController.sendOtp);
router.route('/verify').post(validate(otpAuthValidation.verifyOtp), otpAuthController.verifyOtp);

module.exports = router;
