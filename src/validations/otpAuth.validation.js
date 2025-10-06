const Joi = require('joi');

const sendOtp = {
  body: Joi.object().keys({
    contact: Joi.string().required(),
    contactType: Joi.string().valid('email', 'phone').required(),
    deliveryMethod: Joi.string().valid('email', 'sms', 'whatsapp').required()
  })
};

const verifyOtp = {
  body: Joi.object().keys({
    contact: Joi.string().required(),
    contactType: Joi.string().valid('email', 'phone').required(),
    deliveryMethod: Joi.string().valid('email', 'sms', 'whatsapp').required(),
    otp: Joi.string().required()
  })
};

module.exports = {
  sendOtp,
  verifyOtp
};
