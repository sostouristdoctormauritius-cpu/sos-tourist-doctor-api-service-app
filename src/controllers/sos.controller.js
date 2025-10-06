const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { sosService } = require('../services');
const { successResponse } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');

const createEmergencyRequest = catchAsync(async (req, res) => {
  const sosData = {
    ...req.body,
    userId: req.user._id,
    userLocation: req.body.location // Can be enhanced with GPS coordinates
  };

  const sosRequest = await sosService.createEmergencyRequest(sosData);

  res.status(httpStatus.CREATED).json(
    successResponse(sosRequest, 'Emergency SOS request created successfully', httpStatus.CREATED)
  );
});

const getSosHistory = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const options = {
    sortBy: req.query.sortBy || 'createdAt:desc',
    limit: parseInt(req.query.limit, 10) || 10,
    page: parseInt(req.query.page, 10) || 1
  };

  const result = await sosService.getSosHistory(userId, options);

  res.status(httpStatus.OK).json(
    successResponse(result, 'SOS history retrieved successfully')
  );
});

const getSosRequest = catchAsync(async (req, res) => {
  const { sosId } = req.params;
  const userId = req.user._id;

  const sosRequest = await sosService.getSosRequestById(sosId, userId);

  if (!sosRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'SOS request not found');
  }

  res.status(httpStatus.OK).json(
    successResponse(sosRequest, 'SOS request retrieved successfully')
  );
});

const updateSosStatus = catchAsync(async (req, res) => {
  const { sosId } = req.params;
  const { status, notes } = req.body;
  const userId = req.user._id;

  const updatedSosRequest = await sosService.updateSosStatus(sosId, status, userId, notes);

  res.status(httpStatus.OK).json(
    successResponse(updatedSosRequest, 'SOS request status updated successfully')
  );
});

const getActiveSosRequests = catchAsync(async (req, res) => {
  // Only doctors and admins should access this
  if (!['doctor', 'admin'].includes(req.user.role)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  const options = {
    sortBy: req.query.sortBy || 'createdAt:desc',
    limit: parseInt(req.query.limit, 10) || 20,
    page: parseInt(req.query.page, 10) || 1
  };

  const result = await sosService.getActiveSosRequests(options);

  res.status(httpStatus.OK).json(
    successResponse(result, 'Active SOS requests retrieved successfully')
  );
});

module.exports = {
  createEmergencyRequest,
  getSosHistory,
  getSosRequest,
  updateSosStatus,
  getActiveSosRequests
};
