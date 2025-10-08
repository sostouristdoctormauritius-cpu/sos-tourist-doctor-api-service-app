const Joi = require('joi');

const createPatient = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(1).max(100).required(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    role: Joi.string().valid('user').default('user'),
    dateOfBirth: Joi.date().optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    address: Joi.string().optional(),
    emergencyContact: Joi.object().keys({
      name: Joi.string().required(),
      phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).required(),
      relationship: Joi.string().required()
    }).optional(),
    medicalHistory: Joi.array().items(Joi.object().keys({
      condition: Joi.string().required(),
      diagnosisDate: Joi.date(),
      status: Joi.string().valid('active', 'resolved', 'chronic'),
      notes: Joi.string()
    })).optional(),
    allergies: Joi.array().items(Joi.string()).optional(),
    currentMedications: Joi.array().items(Joi.object().keys({
      name: Joi.string().required(),
      dosage: Joi.string(),
      frequency: Joi.string(),
      prescribedBy: Joi.string(),
      startDate: Joi.date()
    })).optional(),
    isActive: Joi.boolean().default(true)
  })
};

const getPatients = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    isActive: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

const getPatient = {
  params: Joi.object().keys({
    patientId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
  })
};

const updatePatient = {
  params: Joi.object().keys({
    patientId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
  }),
  body: Joi.object().keys({
    name: Joi.string().min(1).max(100).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    dateOfBirth: Joi.date().optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    address: Joi.string().optional(),
    emergencyContact: Joi.object().keys({
      name: Joi.string().required(),
      phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).required(),
      relationship: Joi.string().required()
    }).optional(),
    medicalHistory: Joi.array().items(Joi.object().keys({
      condition: Joi.string().required(),
      diagnosisDate: Joi.date(),
      status: Joi.string().valid('active', 'resolved', 'chronic'),
      notes: Joi.string()
    })).optional(),
    allergies: Joi.array().items(Joi.string()).optional(),
    currentMedications: Joi.array().items(Joi.object().keys({
      name: Joi.string().required(),
      dosage: Joi.string(),
      frequency: Joi.string(),
      prescribedBy: Joi.string(),
      startDate: Joi.date()
    })).optional(),
    isActive: Joi.boolean().optional()
  })
};

const deletePatient = {
  params: Joi.object().keys({
    patientId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
  })
};

module.exports = {
  createPatient,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient
};
