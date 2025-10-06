const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createDoctorNote = {
  body: Joi.object().keys({
    patient: Joi.string().custom(objectId).required(),
    doctor: Joi.string().custom(objectId).required(),
    appointment: Joi.string().custom(objectId).required(),
    note: Joi.string().required()
  })
};

const doctorNoteQuerySchema = Joi.object().keys({
  sortBy: Joi.string(),
  limit: Joi.number().integer(),
  page: Joi.number().integer()
});

const getDoctorNotes = {
  query: Joi.object().keys({
    patient: Joi.string().custom(objectId),
    doctor: Joi.string().custom(objectId),
    appointment: Joi.string().custom(objectId)
  }).concat(doctorNoteQuerySchema)
};

const getDoctorNote = {
  params: Joi.object().keys({
    doctorNoteId: Joi.string().custom(objectId).required()
  })
};

const updateDoctorNote = {
  params: Joi.object().keys({
    doctorNoteId: Joi.string().custom(objectId).required()
  }),
  body: Joi.object()
    .keys({
      note: Joi.string()
    })
    .min(1)
};

const deleteDoctorNote = {
  params: Joi.object().keys({
    doctorNoteId: Joi.string().custom(objectId).required()
  })
};

const getDoctorNotesByPatient = {
  params: Joi.object().keys({
    patientId: Joi.string().custom(objectId).required()
  }),
  query: doctorNoteQuerySchema
};

const getDoctorNoteByAppointment = {
  params: Joi.object().keys({
    appointmentId: Joi.string().custom(objectId).required()
  })
};

module.exports = {
  createDoctorNote,
  getDoctorNotes,
  getDoctorNote,
  updateDoctorNote,
  deleteDoctorNote,
  getDoctorNotesByPatient,
  getDoctorNoteByAppointment
};
