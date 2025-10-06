const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const appConfigValidation = require('../../validations/appConfig.validation');
const appConfigController = require('../../controllers/appConfig.controller');

const router = express.Router();

router
  .route('/')
  .post(
    validate(appConfigValidation.createAppConfig),
    appConfigController.createAppConfig
  )
  .get(
    validate(appConfigValidation.getAppConfigs),
    appConfigController.getAppConfigs
  );

router
  .route('/:configId')
  .get(
    validate(appConfigValidation.getAppConfig),
    appConfigController.getAppConfig
  )
  .patch(
    validate(appConfigValidation.updateAppConfig),
    appConfigController.updateAppConfig
  )
  .delete(
    validate(appConfigValidation.deleteAppConfig),
    appConfigController.deleteAppConfig
  );

// Get config by key
router
  .route('/key/:key')
  .get(
    validate(appConfigValidation.getAppConfigByKey),
    appConfigController.getAppConfigByKey
  );

module.exports = router;
