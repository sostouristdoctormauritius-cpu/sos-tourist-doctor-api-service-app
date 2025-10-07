const Joi = require('joi');

const createService = {
  body: Joi.object().keys({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional(),
    category: Joi.string().min(1).max(50).required(),
    price: Joi.number().min(0).required(),
    duration: Joi.number().integer().min(1).optional(),
    isActive: Joi.boolean().default(true),
    imageUrl: Joi.string().uri().optional()
  })
};

const updateService = {
  body: Joi.object().keys({
    name: Joi.string().min(1).max(100).optional(),
    description: Joi.string().max(500).optional(),
    category: Joi.string().min(1).max(50).optional(),
    price: Joi.number().min(0).optional(),
    duration: Joi.number().integer().min(1).optional(),
    isActive: Joi.boolean().optional(),
    imageUrl: Joi.string().uri().optional()
  })
};

module.exports = {
  createService,
  updateService
};
