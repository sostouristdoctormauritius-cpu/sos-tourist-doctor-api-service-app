const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { availabilityService } = require('../services');
const { successResponse } = require('../utils/apiResponse');
const logger = require('../config/logger');

const createAvailability = catchAsync(async (req, res) => {
  // Handle alternative field names
  const availabilityData = { ...req.body };

  // Map user_id to doctor_id if doctor_id is not provided
  if (!availabilityData.doctor_id && availabilityData.user_id) {
    availabilityData.doctor_id = availabilityData.user_id;
    delete availabilityData.user_id;
  }

  // Map start_date to date if date is not provided
  if (!availabilityData.date && availabilityData.start_date) {
    availabilityData.date = availabilityData.start_date;
    delete availabilityData.start_date;
  }

  // Use end_date as end_time if end_time is not provided
  if (!availabilityData.end_time && availabilityData.end_date) {
    availabilityData.end_time = availabilityData.end_date;
    delete availabilityData.end_date;
  }

  const availability = await availabilityService.createAvailability(availabilityData);
  res.status(httpStatus.CREATED).json(successResponse(availability, 'Availability created successfully', httpStatus.CREATED));
});

const getAvailableSlots = catchAsync(async (req, res) => {
  const { start, end, doctorId, consultationType } = req.query;
  const slots = await availabilityService.getAvailableSlots(start, end, doctorId, consultationType);
  res.status(httpStatus.OK).json(successResponse(slots, 'Available slots retrieved successfully'));
});

const setMyAvailability = catchAsync(async (req, res) => {
  const availabilityData = {
    ...req.body,
    doctorId: req.user._id
  };
  const availability = await availabilityService.setAvailability(req.user._id, availabilityData);
  res.status(httpStatus.CREATED).json(successResponse(availability, 'Availability set successfully', httpStatus.CREATED));
});

const getAvailabilities = catchAsync(async (req, res) => {
  try {
    const availabilities = await availabilityService.getAllAvailabilities();
    res.status(httpStatus.OK).json(successResponse(availabilities, 'Availabilities retrieved successfully'));
  } catch (error) {
    logger.error('Error in getAvailabilities controller:', error);
    throw error;
  }
});

const getAvailability = catchAsync(async (req, res) => {
  try {
    const availability = await availabilityService.getAvailabilityById(req.params.availabilityId);
    res.status(httpStatus.OK).json(successResponse(availability, 'Availability retrieved successfully'));
  } catch (error) {
    logger.error('Error in getAvailability controller:', error);
    throw error;
  }
});

const getAvailabilitiesByDoctor = catchAsync(async (req, res) => {
  try {
    const availabilities = await availabilityService.getAvailabilitiesByDoctor(req.params.doctorId);
    res.status(httpStatus.OK).json(successResponse(availabilities, 'Doctor availabilities retrieved successfully'));
  } catch (error) {
    logger.error('Error in getAvailabilitiesByDoctor controller:', error);
    throw error;
  }
});

const getDoctorAvailabilities = catchAsync(async (req, res) => {
  try {
    const availabilities = await availabilityService.getAvailabilities(req.params.doctorId);
    res.status(httpStatus.OK).json(successResponse(availabilities, 'Doctor availabilities retrieved successfully'));
  } catch (error) {
    logger.error('Error in getDoctorAvailabilities controller:', error);
    throw error;
  }
});

const setDoctorAvailability = catchAsync(async (req, res) => {
  const availability = await availabilityService.setAvailability(req.body.doctorId, req.body);
  res.status(httpStatus.CREATED).json(successResponse(availability, 'Doctor availability set successfully', httpStatus.CREATED));
});

const getMyAvailabilities = catchAsync(async (req, res) => {
  try {
    const availabilities = await availabilityService.getAvailabilities(req.user._id);
    res.status(httpStatus.OK).json(successResponse(availabilities, 'My availabilities retrieved successfully'));
  } catch (error) {
    logger.error('Error in getMyAvailabilities controller:', error);
    throw error;
  }
});

const updateAvailability = catchAsync(async (req, res) => {
  try {
    // Handle alternative field names
    const updateData = { ...req.body };

    // Map user_id to doctor_id if doctor_id is not provided
    if (!updateData.doctor_id && updateData.user_id) {
      updateData.doctor_id = updateData.user_id;
      delete updateData.user_id;
    }

    // Map start_date to date if date is not provided
    if (!updateData.date && updateData.start_date) {
      updateData.date = updateData.start_date;
      delete updateData.start_date;
    }

    // Use end_date as end_time if end_time is not provided
    if (!updateData.end_time && updateData.end_date) {
      updateData.end_time = updateData.end_date;
      delete updateData.end_date;
    }

    const availability = await availabilityService.updateAvailability(req.params.availabilityId, updateData);
    res.status(httpStatus.OK).json(successResponse(availability, 'Availability updated successfully'));
  } catch (error) {
    logger.error('Error in updateAvailability controller:', error);
    throw error;
  }
});

const deleteAvailability = catchAsync(async (req, res) => {
  try {
    await availabilityService.deleteAvailability(req.params.availabilityId);
    res.status(httpStatus.NO_CONTENT).json(successResponse(null, 'Availability deleted successfully', httpStatus.NO_CONTENT));
  } catch (error) {
    logger.error('Error in deleteAvailability controller:', error);
    throw error;
  }
});

module.exports = {
  createAvailability,
  getAvailableSlots,
  setMyAvailability,
  getAvailabilities,
  getAvailability,
  getAvailabilitiesByDoctor,
  getMyAvailabilities,
  setDoctorAvailability,
  getDoctorAvailabilities,
  updateAvailability,
  deleteAvailability
};
