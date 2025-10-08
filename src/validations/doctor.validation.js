const Joi = require('joi');
const { password, objectId } = require('./custom.validation');
const languages = require('../config/languages');

const doctorProfileSchema = Joi.object().keys({
  specialisation: Joi.string().optional(),
  rating: Joi.number().optional(),
  ratingCount: Joi.number().optional(),
  address: Joi.string().optional(),
  workingHours: Joi.string().optional(),
  bio: Joi.string().optional(),
  isListed: Joi.boolean().optional().default(false),
  supportedLanguages: Joi.array().items(Joi.string().valid(...Object.values(languages))).default([]).optional(),
  phoneVisible: Joi.boolean().optional().default(false)
});

const createDoctor = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    phone: Joi.string().optional(),
    profilePicture: Joi.string().optional(),
    doctorProfile: doctorProfileSchema.optional()
  })
};

const getDoctors = {
  query: Joi.object().keys({
    name: Joi.string(),
    specialization: Joi.string(),
    isListed: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100),
    page: Joi.number().integer().min(1)
  })
};

const getDoctor = {
  params: Joi.object().keys({
    doctorId: Joi.string().custom(objectId).required()
  })
};

const updateDoctor = {
  params: Joi.object().keys({
    doctorId: Joi.required().custom(objectId)
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
      phone: Joi.string().optional(),
      profilePicture: Joi.string().optional(),
      doctorProfile: doctorProfileSchema
    })
    .min(1)
};

const deleteDoctor = {
  params: Joi.object().keys({
    doctorId: Joi.string().custom(objectId)
  })
};

const toggleDoctorListing = {
  params: Joi.object().keys({
    doctorId: Joi.string().custom(objectId).required()
  }),
  body: Joi.object().keys({
    isListed: Joi.boolean().required()
  })
};

module.exports = {
  createDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  toggleDoctorListing
};