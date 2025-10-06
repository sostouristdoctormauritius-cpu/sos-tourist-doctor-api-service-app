const Joi = require('joi');
const { objectId } = require('./custom.validation');

const dashboardQuerySchema = Joi.object().keys({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional()
});

const getAdminDashboard = {
  query: dashboardQuerySchema
};

const getDoctorDashboard = {
  params: Joi.object().keys({
    doctorId: Joi.string().custom(objectId).required()
  }),
  query: dashboardQuerySchema
};

const getPatientDashboard = {
  params: Joi.object().keys({
    patientId: Joi.string().custom(objectId).required()
  }),
  query: dashboardQuerySchema
};

module.exports = {
  getAdminDashboard,
  getDoctorDashboard,
  getPatientDashboard
};
