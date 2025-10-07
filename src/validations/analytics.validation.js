const Joi = require('joi');

const exportData = {
  body: Joi.object().keys({
    reportType: Joi.string().valid('dashboard', 'appointments', 'users', 'sos', 'revenue').required(),
    format: Joi.string().valid('csv', 'excel', 'pdf').required(),
    period: Joi.string().valid('today', 'week', 'month', 'quarter', 'year').optional(),
    filters: Joi.object().optional()
  })
};

module.exports = {
  exportData
};
