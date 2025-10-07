const Joi = require('joi');

const initiateCall = {
  body: Joi.object().keys({
    recipientId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
    callType: Joi.string().valid('audio', 'video').default('video'),
    appointmentId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).optional()
  })
};

const generateToken = {
  body: Joi.object().keys({
    roomName: Joi.string().min(1).max(100).required(),
    userIdentity: Joi.string().min(1).max(50).optional()
  })
};

module.exports = {
  initiateCall,
  generateToken
};
