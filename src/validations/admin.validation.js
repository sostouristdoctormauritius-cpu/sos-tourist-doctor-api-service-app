const Joi = require('joi');

const createAdmin = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(1).max(100).required(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    role: Joi.string().valid('admin', 'super_admin').default('admin'),
    permissions: Joi.array().items(Joi.string()).optional(),
    isActive: Joi.boolean().default(true)
  })
};

const getAdmins = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    isActive: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

const getAdmin = {
  params: Joi.object().keys({
    adminId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
  })
};

const updateAdmin = {
  params: Joi.object().keys({
    adminId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
  }),
  body: Joi.object().keys({
    name: Joi.string().min(1).max(100).optional(),
    phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
    role: Joi.string().valid('admin', 'super_admin').optional(),
    permissions: Joi.array().items(Joi.string()).optional(),
    isActive: Joi.boolean().optional()
  })
};

const deleteAdmin = {
  params: Joi.object().keys({
    adminId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required()
  })
};

module.exports = {
  createAdmin,
  getAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin
};
