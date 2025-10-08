const httpStatus = require('http-status').default || require('http-status');
const catchAsync = require('../utils/catchAsync');
const logger = require('../config/logger');
const config = require('../config/config');
const { version } = require('../../package.json');
const path = require('path');
const fs = require('fs');

const getDashboard = catchAsync(async (req, res) => {
  // Check if this is an API request (has /api path or JSON accept header)
  const isApiRequest = req.path.endsWith('/api') ||
                      (req.headers.accept && req.headers.accept.includes('application/json'));

  if (isApiRequest) {
    // For API calls, return JSON data
    const user = req.user; // req.user is populated by auth middleware

    logger.info('Dashboard API accessed by admin user', {
      userId: user.id,
      email: user.email
    });

    try {
      // Get active patients count from database
      const dbManager = require('../db/dbManager');
      const { data: patients, error: patientsError } = await dbManager.supabaseAdapter.supabase
        .from('users')
        .select('*')
        .eq('role', 'patient')
        .eq('is_status', 'active');

      if (patientsError) {
        logger.error('Error fetching active patients:', patientsError);
        throw patientsError;
      }

      const activePatientsCount = Array.isArray(patients) ? patients.length : 0;

      logger.info(`Found ${activePatientsCount} active patients`);

      // Simple dashboard data with real active patients count
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
          activePatients: activePatientsCount,
          systemUptime: '99.9%',
          doctorManagementLink: '/doctors'
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
    } catch (error) {
      logger.error('Error in dashboard controller:', error);
      // Return dashboard data with 0 count if database query fails
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
          activePatients: 0,
          systemUptime: '99.9%',
          doctorManagementLink: '/doctors'
        },
        serviceStatus: {
          databaseConnection: 'ERROR',
          apiService: 'Operational'
        },
        recentActivity: [
          { title: 'System started', time: 'Just now' },
          { title: 'Database connected', time: 'Just now' },
          { title: 'Admin login', time: 'Just now' }
        ]
      };

      return res.status(httpStatus.OK).json(dashboardData);
    }
  } else {
    // For browser requests, serve the dashboard html file
    const dashboardPath = path.join(__dirname, '../../../public/dashboard.html');
    res.sendFile(dashboardPath);
  }
});

module.exports = {
  getDashboard
};