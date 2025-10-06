const dbManager = require('../db/dbManager');

/**
 * Create a new App Config
 * @param {Object} author
 * @param {Object} configBody
 * @returns {Promise<AppConfig>}
 */
const createAppConfig = async (userId, configBody) => {
  configBody.creator = userId;
  return dbManager.create('appConfigs', configBody);
};

/**
 * Query list of App Configs
 * @returns {Promise<AppConfig>}
 */
const getAppConfigs = async () => {
  const configs = await dbManager.findMany('appConfigs', {});
  // Project fields manually as Supabase adapter's aggregate is limited
  return configs.map(config => ({ key: config.key, description: config.description }));
};

/**
 * Get App Config by ID
 * @param {ObjectId} appConfigId
 * @returns {Promise<AppConfig>}
 */
const getAppConfigById = async (appConfigId) => {
  return dbManager.findById('appConfigs', appConfigId);
};

/**
 * Get App Config by key
 * @param {String} key
 * @returns {Promise<AppConfig>}
 */
const getAppConfigByKey = async (key) => {
  return dbManager.findOne('appConfigs', { key });
};

/**
 * Update App Config by ID
 * @param {ObjectId} appConfigId
 * @param {Object} updateBody
 * @returns {Promise<AppConfig>}
 */
const updateAppConfigById = async (appConfigId, updateBody) => {
  const config = await getAppConfigById(appConfigId);
  if (!config) {
    throw new ApiError(httpStatus.NOT_FOUND, 'App Config not found');
  }
  return dbManager.update('appConfigs', appConfigId, updateBody);
};

/**
 * Delete App Config by ID
 * @param {ObjectId} teaappConfigIdmId
 * @returns {Promise<AppConfig>}
 */
const deleteAppConfigById = async (appConfigId) => {
  const config = await getAppConfigById(appConfigId);
  if (!config) {
    throw new ApiError(httpStatus.NOT_FOUND, 'App Config not found');
  }
  await dbManager.delete('appConfigs', appConfigId);
  return config;
};

module.exports = {
  createAppConfig,
  getAppConfigs,
  getAppConfigById,
  getAppConfigByKey,
  updateAppConfigById,
  deleteAppConfigById
};
