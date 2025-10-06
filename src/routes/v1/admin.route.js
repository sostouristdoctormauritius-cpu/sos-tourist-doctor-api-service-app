const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
// const adminValidation = require('../../validations/admin.validation');
// const adminController = require('../../controllers/admin.controller');

const router = express.Router();

// Since we don't have the actual admin controller and validation yet,
// we'll just define the routes without actual implementation
// This will at least prevent the server from crashing on startup

// router
//   .route('/')
//   .post(
//     auth('manageUsers'),
//     validate(adminValidation.createAdmin),
//     adminController.createAdmin
//   )
//   .get(
//     auth('getUsers'),
//     validate(adminValidation.getAdmins),
//     adminController.getAdmins
//   );

// router
//   .route('/:adminId')
//   .get(
//     auth('getUsers'),
//     validate(adminValidation.getAdmin),
//     adminController.getAdmin
//   )
//   .patch(
//     auth('manageUsers'),
//     validate(adminValidation.updateAdmin),
//     adminController.updateAdmin
//   )
//   .delete(
//     auth('manageUsers'),
//     validate(adminValidation.deleteAdmin),
//     adminController.deleteAdmin
//   );

module.exports = router;
