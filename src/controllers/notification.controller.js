const { status } = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { notificationService } = require('../services');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const getNotifications = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const options = {
    sortBy: req.query.sortBy,
    limit: parseInt(req.query.limit, 10) || 10,
    page: parseInt(req.query.page, 10) || 1,
    type: req.query.type
  };

  logger.info('Getting notifications', { userId, options });

  const result = await notificationService.queryNotifications(userId, options);

  res.status(status.OK).send({
    notifications: result.notifications,
    pagination: result.pagination,
    message: 'Notifications retrieved successfully'
  });
});

const getNotification = catchAsync(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  logger.info('Getting notification by ID', { userId, notificationId });

  const notification = await notificationService.getNotificationById(notificationId, userId);

  if (!notification) {
    throw new ApiError(status.NOT_FOUND, 'Notification not found');
  }

  res.status(status.OK).send({
    notification,
    message: 'Notification retrieved successfully'
  });
});

const markAsRead = catchAsync(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  logger.info('Marking notification as read', { userId, notificationId });

  const notification = await notificationService.markNotificationAsRead(notificationId, userId);

  if (!notification) {
    throw new ApiError(status.NOT_FOUND, 'Notification not found');
  }

  res.status(status.OK).send({
    notification,
    message: 'Notification marked as read successfully'
  });
});

const markAllAsRead = catchAsync(async (req, res) => {
  const userId = req.user.id;

  logger.info('Marking all notifications as read', { userId });

  const result = await notificationService.markAllNotificationsAsRead(userId);

  res.status(status.OK).send({
    markedCount: result.markedCount,
    message: 'All notifications marked as read successfully'
  });
});

const deleteNotification = catchAsync(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  logger.info('Deleting notification', { userId, notificationId });

  const notification = await notificationService.deleteNotification(notificationId, userId);

  if (!notification) {
    throw new ApiError(status.NOT_FOUND, 'Notification not found');
  }

  res.status(status.OK).send({
    notification,
    message: 'Notification deleted successfully'
  });
});

const getUnreadCount = catchAsync(async (req, res) => {
  const userId = req.user.id;

  logger.info('Getting unread notification count', { userId });

  const count = await notificationService.getUnreadCount(userId);

  res.status(status.OK).send({
    unreadCount: count,
    message: 'Unread count retrieved successfully'
  });
});

module.exports = {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
};
