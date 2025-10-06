const express = require('express');
const auth = require('../../middlewares/auth');
const dashboardController = require('../../controllers/dashboard.controller');

const router = express.Router();

router
  .route('/')
  .get(
    auth(),
    dashboardController.getDashboard
  );

module.exports = router;
