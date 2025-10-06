const Joi = require('joi');
const { password, objectId } = require('./custom.validation');
const languages = require('../config/languages');

const registerInvited = {
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
    token: Joi.string().required()
  })
};

const userProfileSchema = Joi.object().keys({
  language: Joi.string().optional().valid(...languages),
  nickname: Joi.string().optional(),
  dob: Joi.date().optional(),
  gender: Joi.string().optional(),
  phoneNumber: Joi.string().optional(),
  nationality: Joi.string().optional()
});

const doctorProfileSchema = Joi.object().keys({
  specialisation: Joi.string().optional(),
  rating: Joi.number().optional(),
  ratingCount: Joi.number().optional(),
  address: Joi.string().optional(),
  workingHours: Joi.string().optional(),
  bio: Joi.string().optional(),
  isListed: Joi.boolean().optional().default(false),
  supportedLanguages: Joi.array().items(Joi.string().valid(... Object.values(languages))).default([]).optional()
});

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    role: Joi.string().required().valid('user', 'doctor', 'admin'),
    userProfile: userProfileSchema.optional(),
    doctorProfile: doctorProfileSchema.optional()
  })
};

const userQuerySchema = Joi.object().keys({
  sortBy: Joi.string(),
  limit: Joi.number().integer(),
  page: Joi.number().integer()
});

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string()
  }).concat(userQuerySchema)
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId)
  })
};

const getDoctorById = {
  params: Joi.object().keys({
    doctorId: Joi.string().custom(objectId).required()
  })
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId)
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
      language: Joi.string().optional().valid(... Object.values(languages)),
      role: Joi.string().valid('user', 'doctor', 'admin'),
      userProfile: userProfileSchema,
      doctorProfile: doctorProfileSchema
    })
    .min(1)
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId)
  })
};

const getCurrentUser = {};

const updateCurrentUser = {
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
      language: Joi.string().optional().valid(... Object.values(languages)),
      userProfile: userProfileSchema,
      doctorProfile: doctorProfileSchema
    })
    .min(1)
};

const uploadProfilePicture = {
  file: Joi.object().required()
};

const getDoctors = {
  query: userQuerySchema
};

const getDoctorsWithFilters = {
  query: Joi.object().keys({
    specialization: Joi.string(),
    language: Joi.string(),
    search: Joi.string()
  }).concat(userQuerySchema)
};

module.exports = {
  registerInvited,
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getCurrentUser,
  updateCurrentUser,
  uploadProfilePicture,
  getDoctors,
  getDoctorById,
  getDoctorsWithFilters
};
