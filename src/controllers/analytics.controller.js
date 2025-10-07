const { status } = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { analyticsService } = require('../services');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const getDashboardAnalytics = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { period = 'month', startDate, endDate } = req.query;

  logger.info('Getting dashboard analytics', { userId, period, startDate, endDate });

  const analytics = await analyticsService.getDashboardAnalytics(userId, {
    period,
    startDate,
    endDate
  });

  res.status(status.OK).send({
    analytics,
    message: 'Dashboard analytics retrieved successfully'
  });
});

const getAppointmentAnalytics = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { period = 'month', groupBy = 'day', doctorId } = req.query;

  logger.info('Getting appointment analytics', { userId, period, groupBy, doctorId });

  const analytics = await analyticsService.getAppointmentAnalytics(userId, {
    period,
    groupBy,
    doctorId
  });

  res.status(status.OK).send({
    analytics,
    message: 'Appointment analytics retrieved successfully'
  });
});

const getUserAnalytics = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { period = 'month', userType } = req.query;

  logger.info('Getting user analytics', { userId, period, userType });

  const analytics = await analyticsService.getUserAnalytics(userId, {
    period,
    userType
  });

  res.status(status.OK).send({
    analytics,
    message: 'User analytics retrieved successfully'
  });
});

const getSosAnalytics = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { period = 'month', status } = req.query;

  logger.info('Getting SOS analytics', { userId, period, status });

  const analytics = await analyticsService.getSosAnalytics(userId, {
    period,
    status
  });

  res.status(status.OK).send({
    analytics,
    message: 'SOS analytics retrieved successfully'
  });
});

const getRevenueAnalytics = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { period = 'month', groupBy = 'day' } = req.query;

  logger.info('Getting revenue analytics', { userId, period, groupBy });

  const analytics = await analyticsService.getRevenueAnalytics(userId, {
    period,
    groupBy
  });

  res.status(status.OK).send({
    analytics,
    message: 'Revenue analytics retrieved successfully'
  });
});

const exportAnalytics = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { reportType, format, period, filters } = req.body;

  if (!reportType || !format) {
    throw new ApiError(status.BAD_REQUEST, 'Report type and format are required');
  }

  logger.info('Exporting analytics', { userId, reportType, format, period });

  const exportData = await analyticsService.exportAnalytics(userId, {
    reportType,
    format,
    period,
    filters
  });

  res.status(status.OK).send({
    exportData,
    message: 'Analytics exported successfully'
  });
});

module.exports = {
  getDashboardAnalytics,
  getAppointmentAnalytics,
  getUserAnalytics,
  getSosAnalytics,
  getRevenueAnalytics,
  exportAnalytics
};
