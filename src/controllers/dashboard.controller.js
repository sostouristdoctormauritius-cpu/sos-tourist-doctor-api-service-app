const httpStatus = require('http-status').default || require('http-status');
const catchAsync = require('../utils/catchAsync');
const logger = require('../config/logger');
const config = require('../config/config');
const { version } = require('../../package.json');
const path = require('path');
const fs = require('fs');

const getDashboard = catchAsync(async (req, res) => {
  // For API calls, return JSON data
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    const user = req.user; // req.user is populated by auth middleware

    logger.info('Dashboard accessed by admin user', {
      userId: user.id,
      email: user.email
    });

    // Simple dashboard data (assuming this data will be fetched from services in a real app)
    const dashboardData = {
      user: {
        name: user.name || 'Admin',
        email: user.email || ''
      },
      apiInfo: {
        version: version,
        environment: config.env,
        port: config.port
      },
      stats: {
        activeUsers: 0,
        invoices: 0,
        activeCases: 0,
        systemUptime: '99.9%',
        doctorManagementLink: '/doctors' // Link to doctor management page
      },
      serviceStatus: {
        databaseConnection: 'OK',
        apiService: 'Operational'
      },
      recentActivity: [
        { title: 'System started', time: 'Just now' },
        { title: 'Database connected', time: 'Just now' },
        { title: 'Admin login', time: 'Just now' }
      ]
    };

    const statusCode = httpStatus.OK || httpStatus.default?.OK || 200;
    return res.status(statusCode).json(dashboardData);
  }

  // For browser requests, serve the dashboard html file
  const dashboardPath = path.join(__dirname, '../../../public/dashboard.html');
  res.sendFile(dashboardPath);
});

module.exports = {
  getDashboard
};
