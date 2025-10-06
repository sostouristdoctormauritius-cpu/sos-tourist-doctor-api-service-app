const Joi = require('joi');

const broadcastMessage = {
  body: Joi.object().keys({
    event: Joi.string().required(),
    data: Joi.object().required()
  })
};

module.exports = {
  broadcastMessage
};
