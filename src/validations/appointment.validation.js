const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createAppointment = {
  body: Joi.object().keys({
    doctor_id: Joi.string().custom(objectId).required(),
    patient_id: Joi.string().custom(objectId).required(),
    appointment_date: Joi.date().required(),
    appointment_type: Joi.string().valid('video', 'chat', 'voice').required(),
    additional_note: Joi.string().optional().allow(''),
    timezone: Joi.string().optional()
  })
};

const getAppointments = {
  query: Joi.object().keys({
    doctor_id: Joi.string().custom(objectId),
    patient_id: Joi.string().custom(objectId),
    status: Joi.string().valid('pending', 'confirmed', 'cancelled', 'completed'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

const getAllAppointments = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional()
  })
};

const getAppointment = {
  params: Joi.object().keys({
    appointmentId: Joi.string().custom(objectId).required()
  })
};

const updateAppointment = {
  params: Joi.object().keys({
    appointmentId: Joi.string().custom(objectId).required()
  }),
  body: Joi.object()
    .keys({
      doctor_id: Joi.string().custom(objectId),
      patient_id: Joi.string().custom(objectId),
      appointment_date: Joi.date(),
      appointment_type: Joi.string().valid('video', 'chat', 'voice'),
      additional_note: Joi.string().optional().allow(''),
      timezone: Joi.string().optional()
    })
    .min(1)
};

const deleteAppointment = {
  params: Joi.object().keys({
    appointmentId: Joi.string().custom(objectId).required()
  })
};

const appointmentQuerySchema = Joi.object().keys({
  status: Joi.string().valid('pending', 'confirmed', 'cancelled', 'completed'),
  sortBy: Joi.string(),
  limit: Joi.number().integer(),
  page: Joi.number().integer()
});

const getAppointmentsByDoctor = {
  params: Joi.object().keys({
    doctorId: Joi.string().custom(objectId).required()
  }),
  query: appointmentQuerySchema
};

const getAppointmentsByPatient = {
  params: Joi.object().keys({
    patientId: Joi.string().custom(objectId).required()
  }),
  query: appointmentQuerySchema
};

const updateAppointmentStatus = {
  params: Joi.object().keys({
    appointmentId: Joi.string().custom(objectId).required()
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('pending', 'confirmed', 'cancelled', 'completed').required(),
    cancellation_reason: Joi.string().optional().allow('')
  })
};

const checkAvailability = {
  params: Joi.object().keys({
    doctorId: Joi.string().custom(objectId).required()
  }),
  query: Joi.object().keys({
    date: Joi.date().required()
  })
};

const getCurrentMonthAppointments = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

module.exports = {
  createAppointment,
  getAppointments,
  getAllAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  updateAppointmentStatus,
  getAppointmentsByPatient,
  checkAvailability,
  getCurrentMonthAppointments
};
