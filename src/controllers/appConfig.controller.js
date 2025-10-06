const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { appConfigService } = require('../services');
const ApiError = require('../utils/ApiError');

const createAppConfig = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const config = await appConfigService.createAppConfig(userId, req.body);
  res.status(httpStatus.CREATED).send(config);
});

const getAppConfigs = catchAsync(async (req, res) => {
  const configs = await appConfigService.getAppConfigs();
  res.json(configs);
});

const getAppConfig = catchAsync(async (req, res) => {
  const config = await appConfigService.getAppConfigById(req.params.configId);
  if (!config) {
    throw new ApiError(httpStatus.NOT_FOUND, 'App Config not found');
  }
  res.json(config);
});

const getAppConfigByKey = catchAsync(async (req, res) => {
  const config = await appConfigService.getAppConfigByKey(req.params.key);
  res.json(config);
});

const updateAppConfig = catchAsync(async (req, res) => {
  const config = await appConfigService.updateAppConfigById(req.params.configId, req.body);
  res.send(config);
});

const deleteAppConfig = catchAsync(async (req, res) => {
  await appConfigService.deleteAppConfigById(req.params.configId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createAppConfig,
  getAppConfigs,
  getAppConfig,
  getAppConfigByKey,
  updateAppConfig,
  deleteAppConfig
};
