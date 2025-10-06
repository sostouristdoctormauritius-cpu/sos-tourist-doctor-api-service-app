const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createInvoice = {
  body: Joi.object().keys({
    patient_id: Joi.string().custom(objectId).required(),
    doctor_id: Joi.string().custom(objectId).required(),
    appointment_id: Joi.string().custom(objectId).required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().required(),
    description: Joi.string().optional().allow(''),
    due_date: Joi.date().optional(),
    status: Joi.string().valid('pending', 'paid', 'overdue', 'cancelled').default('pending')
  })
};

const invoiceQuerySchema = Joi.object().keys({
  status: Joi.string().valid('pending', 'paid', 'overdue', 'cancelled'),
  sortBy: Joi.string(),
  limit: Joi.number().integer(),
  page: Joi.number().integer()
});

const getInvoices = {
  query: Joi.object().keys({
    patient_id: Joi.string().custom(objectId),
    doctor_id: Joi.string().custom(objectId)
  }).concat(invoiceQuerySchema)
};

const getInvoice = {
  params: Joi.object().keys({
    invoiceId: Joi.string().custom(objectId).required()
  })
};

const updateInvoice = {
  params: Joi.object().keys({
    invoiceId: Joi.string().custom(objectId).required()
  }),
  body: Joi.object()
    .keys({
      amount: Joi.number().positive(),
      currency: Joi.string(),
      description: Joi.string().optional().allow(''),
      due_date: Joi.date().optional(),
      status: Joi.string().valid('pending', 'paid', 'overdue', 'cancelled')
    })
    .min(1)
};

const deleteInvoice = {
  params: Joi.object().keys({
    invoiceId: Joi.string().custom(objectId).required()
  })
};

const getInvoicesByPatient = {
  params: Joi.object().keys({
    patientId: Joi.string().custom(objectId).required()
  }),
  query: invoiceQuerySchema
};

const getInvoicesByDoctor = {
  params: Joi.object().keys({
    doctorId: Joi.string().custom(objectId).required()
  }),
  query: invoiceQuerySchema
};

const getInvoicesByRole = {
  params: Joi.object().keys({
    role: Joi.string().valid('patient', 'doctor').required(),
    userId: Joi.string().custom(objectId).required()
  }),
  query: invoiceQuerySchema
};

const getAllInvoices = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoicesByPatient,
  getInvoicesByDoctor,
  getInvoicesByRole,
  getAllInvoices
};
