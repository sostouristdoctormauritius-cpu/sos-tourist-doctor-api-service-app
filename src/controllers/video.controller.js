const { status } = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { videoService } = require('../services');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const initiateCall = catchAsync(async (req, res) => {
  const { recipientId, callType = 'video', appointmentId } = req.body;
  const userId = req.user.id;

  if (!recipientId) {
    throw new ApiError(status.BAD_REQUEST, 'Recipient ID is required');
  }

  logger.info('Initiating video call', { userId, recipientId, callType, appointmentId });

  const call = await videoService.initiateCall(userId, recipientId, callType, appointmentId);

  res.status(status.CREATED).send({
    call,
    message: 'Video call initiated successfully'
  });
});

const answerCall = catchAsync(async (req, res) => {
  const { callId } = req.params;
  const userId = req.user.id;

  logger.info('Answering video call', { userId, callId });

  const call = await videoService.answerCall(callId, userId);

  if (!call) {
    throw new ApiError(status.NOT_FOUND, 'Call not found');
  }

  res.status(status.OK).send({
    call,
    message: 'Video call answered successfully'
  });
});

const endCall = catchAsync(async (req, res) => {
  const { callId } = req.params;
  const userId = req.user.id;

  logger.info('Ending video call', { userId, callId });

  const call = await videoService.endCall(callId, userId);

  if (!call) {
    throw new ApiError(status.NOT_FOUND, 'Call not found');
  }

  res.status(status.OK).send({
    call,
    message: 'Video call ended successfully'
  });
});

const getCallStatus = catchAsync(async (req, res) => {
  const { callId } = req.params;
  const userId = req.user.id;

  logger.info('Getting call status', { userId, callId });

  const call = await videoService.getCallStatus(callId, userId);

  if (!call) {
    throw new ApiError(status.NOT_FOUND, 'Call not found');
  }

  res.status(status.OK).send({
    call,
    message: 'Call status retrieved successfully'
  });
});

const getCallHistory = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const options = {
    sortBy: req.query.sortBy || 'createdAt:desc',
    limit: parseInt(req.query.limit, 10) || 20,
    page: parseInt(req.query.page, 10) || 1,
    callType: req.query.callType
  };

  logger.info('Getting call history', { userId, options });

  const result = await videoService.getCallHistory(userId, options);

  res.status(status.OK).send({
    calls: result.calls,
    pagination: result.pagination,
    message: 'Call history retrieved successfully'
  });
});

const generateToken = catchAsync(async (req, res) => {
  const { roomName, userIdentity } = req.body;
  const userId = req.user.id;

  if (!roomName) {
    throw new ApiError(status.BAD_REQUEST, 'Room name is required');
  }

  logger.info('Generating video token', { userId, roomName, userIdentity });

  const token = await videoService.generateVideoToken(userId, roomName, userIdentity);

  res.status(status.OK).send({
    token,
    message: 'Video token generated successfully'
  });
});

module.exports = {
  initiateCall,
  answerCall,
  endCall,
  getCallStatus,
  getCallHistory,
  generateToken
};
