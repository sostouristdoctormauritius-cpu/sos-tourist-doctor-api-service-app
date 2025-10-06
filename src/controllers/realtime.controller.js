const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const socketService = require('../services/socket.service');

/**
 * Get real-time server status
 */
const getStatus = catchAsync(async (req, res) => {
  res.status(httpStatus.OK).send({
    connectedUsers: socketService.getConnectedUserCount(),
    status: 'operational'
  });
});

/**
 * Broadcast a message to all connected users
 */
const broadcastMessage = catchAsync(async (req, res) => {
  const { event, data } = req.body;

  if (!event) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Event name is required');
  }

  socketService.broadcastToAll(event, data);

  res.status(httpStatus.OK).send({
    message: 'Message broadcasted successfully'
  });
});

module.exports = {
  getStatus,
  broadcastMessage
};
