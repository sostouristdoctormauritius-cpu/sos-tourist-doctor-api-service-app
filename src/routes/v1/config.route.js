const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
// const configValidation = require('../../validations/config.validation');
// const configController = require('../../controllers/config.controller');

const router = express.Router();

// Since we don't have the actual config controller and validation yet,
// we'll just define the routes without actual implementation
// This will at least prevent the server from crashing on startup

// router
//   .route('/')
//   .post(
//     auth('manageUsers'),
//     validate(configValidation.createConfig),
//     configController.createConfig
//   )
//   .get(
//     auth('getUsers'),
//     validate(configValidation.getConfigs),
//     configController.getConfigs
//   );

// router
//   .route('/:configId')
//   .get(
//     auth('getUsers'),
//     validate(configValidation.getConfig),
//     configController.getConfig
//   )
//   .patch(
//     auth('manageUsers'),
//     validate(configValidation.updateConfig),
//     configController.updateConfig
//   )
//   .delete(
//     auth('manageUsers'),
//     validate(configValidation.deleteConfig),
//     configController.deleteConfig
//   );

module.exports = router;
