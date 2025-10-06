const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createAvailability = {
  body: Joi.object().keys({
    doctor_id: Joi.string().custom(objectId).required(),
    user_id: Joi.string().custom(objectId), // Alternative field name for doctor_id
    date: Joi.date().required(),
    start_date: Joi.date(), // Alternative field name for date
    start_time: Joi.string().required(), // Format: "HH:mm"
    end_time: Joi.string().required(), // Format: "HH:mm"
    end_date: Joi.date(), // Alternative field for end time
    consultation_types: Joi.array().items(Joi.string()), // Additional field
    is_recurring: Joi.boolean().optional().default(false),
    recurrence_pattern: Joi.string().valid('daily', 'weekly', 'monthly').optional(),
    recurrence_end_date: Joi.date().optional()
  }).oxor('doctor_id', 'user_id') // Only one of doctor_id or user_id should be present
    .oxor('date', 'start_date') // Only one of date or start_date should be present
    .oxor('end_time', 'end_date') // Only one of end_time or end_date should be present
};

const availabilityQuerySchema = Joi.object().keys({
  date: Joi.date(),
  sortBy: Joi.string(),
  limit: Joi.number().integer(),
  page: Joi.number().integer()
});

const getAvailabilities = {
  query: Joi.object().keys({
    doctor_id: Joi.string().custom(objectId)
  }).concat(availabilityQuerySchema)
};

const getAvailability = {
  params: Joi.object().keys({
    availabilityId: Joi.string().custom(objectId).required()
  })
};

const updateAvailability = {
  params: Joi.object().keys({
    availabilityId: Joi.string().custom(objectId).required()
  }),
  body: Joi.object()
    .keys({
      doctor_id: Joi.string().custom(objectId),
      user_id: Joi.string().custom(objectId), // Alternative field name for doctor_id
      date: Joi.date(),
      start_date: Joi.date(), // Alternative field name for date
      start_time: Joi.string(), // Format: "HH:mm"
      end_time: Joi.string(), // Format: "HH:mm"
      end_date: Joi.date(), // Alternative field for end time
      consultation_types: Joi.array().items(Joi.string()), // Additional field
      is_recurring: Joi.boolean(),
      recurrence_pattern: Joi.string().valid('daily', 'weekly', 'monthly'),
      recurrence_end_date: Joi.date()
    })
    .min(1)
    .oxor('doctor_id', 'user_id') // Only one of doctor_id or user_id should be present
    .oxor('date', 'start_date') // Only one of date or start_date should be present
    .oxor('end_time', 'end_date') // Only one of end_time or end_date should be present
};

const deleteAvailability = {
  params: Joi.object().keys({
    availabilityId: Joi.string().custom(objectId).required()
  })
};

const getAvailabilitiesByDoctor = {
  params: Joi.object().keys({
    doctorId: Joi.string().custom(objectId).required()
  }),
  query: availabilityQuerySchema
};

module.exports = {
  createAvailability,
  getAvailabilities,
  getAvailability,
  updateAvailability,
  deleteAvailability,
  getAvailabilitiesByDoctor
};
