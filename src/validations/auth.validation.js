const Joi = require('joi');
const { password } = require('./custom.validation');
const languages = require('../config/languages');

const register = {
  body: Joi.object().keys({
    email: Joi.string().trim().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().trim().optional(),
    userProfile: Joi.object().keys({
      language: Joi.string().optional().valid(...languages),
      nickname: Joi.string().optional(),
      dob: Joi.date().optional(),
      gender: Joi.string().optional(),
      nationality: Joi.string().optional()
    }).optional(),
    profilePicture : Joi.string().optional(),
    phone : Joi.string().required(),
    country_code : Joi.string().required()
  })
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().trim().required(),
    password: Joi.string().required()
  })
};

const loginAdmin = {
  body: Joi.object().keys({
    email: Joi.string().trim().required(),
    password: Joi.string().required()
  })
};



const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required()
  })
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().optional()
  }),
  query: Joi.object().keys({
    refreshToken: Joi.string().optional()
  })
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().required()
  })
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required()
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password)
  })
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required()
  })
};

const verifyOtp = {
  body: Joi.object().keys({
    username: Joi.string().trim().required(),
    otp: Joi.string().required()
  })
};

const sendOtp = {
  body: Joi.object().keys({
    email: Joi.string().required().email()
  })
};

module.exports = {
  register,
  login,
  loginAdmin,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyEmail,
  verifyOtp,
  logout
};
