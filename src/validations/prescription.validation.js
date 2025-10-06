const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createPrescription = {
  body: Joi.object().keys({
    patient: Joi.string().custom(objectId).required(),
    doctor: Joi.string().custom(objectId).required(),
    appointment: Joi.string().custom(objectId).required(),
    medications: Joi.array().items(
      Joi.object().keys({
        name: Joi.string().required(),
        dosage: Joi.string().required(),
        duration: Joi.string().required(),
        strength: Joi.string().required(),
        idealTimes: Joi.array().items(Joi.string())
      })
    ).required()
  })
};

const prescriptionQuerySchema = Joi.object().keys({
  sortBy: Joi.string(),
  limit: Joi.number().integer(),
  page: Joi.number().integer()
});

const getPrescriptions = {
  query: Joi.object().keys({
    patient: Joi.string().custom(objectId),
    doctor: Joi.string().custom(objectId),
    appointment: Joi.string().custom(objectId)
  }).concat(prescriptionQuerySchema)
};

const getPrescription = {
  params: Joi.object().keys({
    prescriptionId: Joi.string().custom(objectId).required()
  })
};

const updatePrescription = {
  params: Joi.object().keys({
    prescriptionId: Joi.string().custom(objectId).required()
  }),
  body: Joi.object()
    .keys({
      medications: Joi.array().items(
        Joi.object().keys({
          name: Joi.string(),
          dosage: Joi.string(),
          duration: Joi.string(),
          strength: Joi.string(),
          idealTimes: Joi.array().items(Joi.string())
        })
      )
    })
    .min(1)
};

const deletePrescription = {
  params: Joi.object().keys({
    prescriptionId: Joi.string().custom(objectId).required()
  })
};

const getPrescriptionsByPatient = {
  params: Joi.object().keys({
    patientId: Joi.string().custom(objectId).required()
  }),
  query: prescriptionQuerySchema
};

const getPrescriptionsByDoctor = {
  params: Joi.object().keys({
    doctorId: Joi.string().custom(objectId).required()
  }),
  query: prescriptionQuerySchema
};

const getPrescriptionsFiltered = {
  params: Joi.object().keys({
    role: Joi.string().valid('patient', 'doctor').optional(),
    userId: Joi.string().custom(objectId).optional()
  }),
  query: Joi.object().keys({
    patient: Joi.string().custom(objectId).optional(),
    doctor: Joi.string().custom(objectId).optional(),
    appointment: Joi.string().custom(objectId).optional(),
    sortBy: Joi.string().optional(),
    limit: Joi.number().integer().optional(),
    page: Joi.number().integer().optional()
  })
};

const getPrescriptionByAppointment = {
  params: Joi.object().keys({
    appointmentId: Joi.string().custom(objectId).required()
  })
};

module.exports = {
  createPrescription,
  getPrescriptions,
  getPrescription,
  updatePrescription,
  deletePrescription,
  getPrescriptionsByPatient,
  getPrescriptionsByDoctor,
  getPrescriptionsFiltered,
  getPrescriptionByAppointment
};
