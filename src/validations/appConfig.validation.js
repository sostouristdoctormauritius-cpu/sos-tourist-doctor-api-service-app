const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createAppConfig = {
  body: Joi.object().keys({
    key: Joi.string().required(),
    value: Joi.any().required(),
    description: Joi.string().optional().allow(''),
    is_public: Joi.boolean().optional().default(false)
  })
};

const getAppConfigs = {
  query: Joi.object().keys({
    key: Joi.string(),
    is_public: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer()
  })
};

const getAppConfig = {
  params: Joi.object().keys({
    configId: Joi.string().custom(objectId).required()
  })
};

const updateAppConfig = {
  params: Joi.object().keys({
    configId: Joi.string().custom(objectId).required()
  }),
  body: Joi.object()
    .keys({
      key: Joi.string(),
      value: Joi.any(),
      description: Joi.string().optional().allow(''),
      is_public: Joi.boolean()
    })
    .min(1)
};

const deleteAppConfig = {
  params: Joi.object().keys({
    configId: Joi.string().custom(objectId).required()
  })
};

const getAppConfigByKey = {
  params: Joi.object().keys({
    key: Joi.string().required()
  })
};

module.exports = {
  createAppConfig,
  getAppConfigs,
  getAppConfig,
  updateAppConfig,
  deleteAppConfig,
  getAppConfigByKey
};
