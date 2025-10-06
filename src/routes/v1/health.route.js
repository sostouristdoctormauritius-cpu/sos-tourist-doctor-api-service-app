const express = require('express');
const config = require('../../config/config');
const socketService = require('../../services/socket.service');
const dbHealthCheckService = require('../../services/dbHealthCheck.service');
const metricsService = require('../../services/metrics.service');

const router = express.Router();
const catchAsync = require('../../utils/catchAsync');

// Health check endpoint for load balancers and monitoring
router.get('/', catchAsync(async (req, res) => {
  // Check database connectivity
  const dbHealth = await dbHealthCheckService.checkAllDatabasesHealth();

  // Even if database is not healthy, we still return a 200 OK
  // since the API itself is running. Database issues are reported in the response.

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    version: config.version || '1.0.0',
    services: {
      database: dbHealth.status === 'healthy' ? 'connected' : 'issues',
      realtime: socketService.io ? 'operational' : 'not initialized'
    },
    databaseDetails: dbHealth
  });
}));

// Database health check
router.get('/database', async (req, res) => {
  const healthStatus = await dbHealthCheckService.checkAllDatabasesHealth();
  res.status(healthStatus.status === 'healthy' ? 200 : 503).send(healthStatus);
});

// Database statistics
router.get('/database/stats', catchAsync(async (req, res) => {
  const stats = await dbHealthCheckService.getDatabaseStats();
  res.status(200).send(stats);
}));

// Detailed health check for debugging
router.get('/details', catchAsync(async (req, res) => {
  // Check database connectivity using existing service
  const dbHealth = await dbHealthCheckService.checkAllDatabasesHealth();

  // Get memory usage
  const memoryUsage = process.memoryUsage();

  // Get metrics
  const metrics = metricsService.getMetrics();

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100 + ' MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100 + ' MB',
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100 + ' MB',
      external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100 + ' MB'
    },
    database: dbHealth,
    realtime: {
      status: socketService.io ? 'operational' : 'not initialized',
      connectedUsers: socketService.io ? socketService.getConnectedUserCount() : 0
    },
    metrics: {
      apiRequests: metrics.apiRequests,
      database: metrics.database,
      users: metrics.users,
      errors: metrics.errors
    }
  });
}));

module.exports = router;
