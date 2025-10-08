const express = require('express');
const auth = require('../../middlewares/auth');
const dashboardController = require('../../controllers/dashboard.controller');

const router = express.Router();

// API endpoint for JSON data (protected)
router
  .route('/api')
  .get(
    auth(),
    dashboardController.getDashboard
  );

// HTML dashboard endpoint (protected)
router
  .route('/')
  .get(
    auth(),
    dashboardController.getDashboard
  );

module.exports = router;