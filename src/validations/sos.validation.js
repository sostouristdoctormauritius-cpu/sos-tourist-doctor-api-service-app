const Joi = require('joi');

const createEmergencyRequest = {
  body: Joi.object().keys({
    emergencyType: Joi.string().valid('medical', 'accident', 'other').required(),
    description: Joi.string().max(500).required(),
    location: Joi.object().keys({
      address: Joi.string().required(),
      coordinates: Joi.object().keys({
        lat: Joi.number().required(),
        lng: Joi.number().required()
      }).optional(),
      city: Joi.string().optional(),
      country: Joi.string().optional()
    }).required(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
    contactNumber: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    additionalInfo: Joi.string().max(1000).optional()
  })
};

const getSosRequest = {
  params: Joi.object().keys({
    sosId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
  })
};

const updateSosStatus = {
  params: Joi.object().keys({
    sosId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('pending', 'assigned', 'in_progress', 'resolved', 'cancelled').required(),
    notes: Joi.string().max(500).optional(),
    assignedDoctorId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).optional(),
    estimatedArrivalTime: Joi.date().optional()
  })
};

module.exports = {
  createEmergencyRequest,
  getSosRequest,
  updateSosStatus
};
