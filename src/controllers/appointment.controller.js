const { default: httpStatus } = require('http-status');

console.log('httpStatus:', httpStatus);

const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');
const { appointmentService, paymentService } = require('../services');
const { createSimpleAppointment } = require('../services/appointment.service');
const { successResponse, paginatedResponse } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');

const checkAvailability = catchAsync(async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;
  const availability = await appointmentService.checkAvailability(doctorId, date);
  res.status(httpStatus.OK).json(successResponse(availability, 'Availability checked successfully'));
});

const getAppointments = catchAsync(async (req, res) => {
  // Check if user ID is available
  if (!req.user || !req.user._id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User ID is required');
  }

  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await appointmentService.getAppointmentsWithPagination(req.user._id, options);

  // Standardize pagination response format
  const response = {
    results: result.docs || result.results || [],
    page: result.page || result.currentPage || 1,
    limit: result.limit,
    totalPages: result.totalPages || 0,
    totalResults: result.totalDocs || result.totalResults || 0
  };

  res.status(httpStatus.OK).json(successResponse(response, 'Appointments retrieved successfully'));
});

const getAppointmentById = catchAsync(async (req, res) => {
  const appointment = await appointmentService.getAppointmentById(req.params.appointmentId);
  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Appointment not found');
  }
  res.status(httpStatus.OK).json(successResponse(appointment, 'Appointment retrieved successfully'));
});

const simpleCreateAppointment = catchAsync(async (req, res) => {
  const appointment = await createSimpleAppointment(req.body);
  res.status(httpStatus.CREATED).json(successResponse(appointment, 'Appointment created successfully', httpStatus.CREATED));
});


const bookAppointment = catchAsync(async (req, res) => {
  const appointmentData = {
    ...req.body,
    userId: req.user._id
  };
  const appointment = await appointmentService.bookAppointment(appointmentData);
  res.status(httpStatus.CREATED).json(successResponse(appointment, 'Appointment booked successfully', httpStatus.CREATED));
});

const updateAppointmentStatus = catchAsync(async (req, res) => {
  const { appointmentId, status } = req.body;
  const appointment = await appointmentService.updateAppointmentStatus(appointmentId, status);
  res.status(httpStatus.OK).json(successResponse(appointment, 'Appointment status updated successfully'));
});

const cancelAppointment = catchAsync(async (req, res) => {
  const appointment = await appointmentService.cancelAppointment(req.params.appointmentId);
  res.status(httpStatus.OK).json(successResponse(appointment, 'Appointment cancelled successfully'));
});

const getAppointmentsByPatient = catchAsync(async (req, res) => {
  const appointments = await appointmentService.getAppointmentsByPatientId(req.params.patientId);
  res.status(httpStatus.OK).json(successResponse(appointments, 'Patient appointments retrieved successfully'));
});

const getUpcomingAppointmentsUnified = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const doctorId = req.params.doctorId || req.user._id; // Determine doctorId
  const appointments = await appointmentService.getUpcomingAppointments(doctorId, startDate, endDate);
  res.status(httpStatus.OK).json(successResponse(appointments, 'Upcoming appointments retrieved successfully'));
});

const getCompletedAndCancelledAppointments = catchAsync(async (req, res) => {
  const options = {
    limit: req.query.limit ? parseInt(req.query.limit, 10) : 10,
    page: req.query.page ? parseInt(req.query.page, 10) : 1
  };
  const result = await appointmentService.getCompletedAndCancelledAppointments(req.user._id, options);

  // Standardize pagination response format
  const response = {
    results: result.docs || result.results || [],
    page: result.page || result.currentPage || 1,
    limit: result.limit,
    totalPages: result.totalPages || 0,
    totalResults: result.totalDocs || result.totalResults || 0
  };

  res.status(httpStatus.OK).json(successResponse(response, 'Completed and cancelled appointments retrieved successfully'));
});

const changeAppointmentDoctor = catchAsync(async (req, res) => {
  const { appointmentId, newDoctorId } = req.body;
  const updatedAppointment = await appointmentService.changeAppointmentDoctor(appointmentId, newDoctorId);
  res.status(httpStatus.OK).json(successResponse(updatedAppointment, 'Appointment doctor changed successfully'));
});

/**
 * Get all appointments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllAppointments = catchAsync(async (req, res) => {
  try {
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'startDate', 'endDate']);
    console.log('getAllAppointments called with options:', options);

    const result = await appointmentService.getAllAppointments(options);

    console.log('Service result:', result);

    // Standardize pagination response format with safety checks
    const response = {
      results: Array.isArray(result.docs || result.results) ? (result.docs || result.results) : [],
      page: Number(result.page || result.currentPage || 1),
      limit: Number.isInteger(result.limit) ? result.limit : 10,
      totalPages: Number(result.totalPages || 0),
      totalResults: Number(result.totalDocs || result.totalResults || 0)
    };

    console.log('Formatted response:', response);

    const successResp = successResponse(response, 'All appointments retrieved successfully');
    console.log('Success response:', successResp);

    res.status(httpStatus.OK).json(successResp);
  } catch (error) {
    console.error('Error in getAllAppointments:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
});

/**
 * Get all appointments for public dashboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPublicAppointments = catchAsync(async (req, res) => {
  try {
    console.log('getPublicAppointments called with query params:', req.query);
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'startDate', 'endDate']);
    console.log('Processed options:', options);
    const result = await appointmentService.getAllAppointments(options);
    console.log('Service result:', result);

    // Standardize pagination response format
    const response = {
      results: result.docs || result.results || [],
      page: result.page || result.currentPage || 1,
      limit: result.limit,
      totalPages: result.totalPages || 0,
      totalResults: result.totalDocs || result.totalResults || 0
    };

    res.status(httpStatus.OK).json(successResponse(response, 'Public appointments retrieved successfully'));
  } catch (error) {
    console.error('Error in getPublicAppointments:', error);
    throw error;
  }
});

const getCurrentMonthAppointments = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await appointmentService.getCurrentMonthAppointments(options);

  // Standardize pagination response format
  const response = {
    results: result.docs || result.results || [],
    page: result.page || result.currentPage || 1,
    limit: result.limit,
    totalPages: result.totalPages || 0,
    totalResults: result.totalDocs || result.totalResults || 0
  };

  res.status(httpStatus.OK).json(successResponse(response, 'Current month appointments retrieved successfully'));
});

const getAvailableSlots = catchAsync(async (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Doctor ID and date are required');
  }

  const availableSlots = await appointmentService.getAvailableSlots(doctorId, date);

  res.status(httpStatus.OK).json(
    successResponse(availableSlots, 'Available slots retrieved successfully')
  );
});

const processPayment = catchAsync(async (req, res) => {
  const { appointmentId } = req.params;
  const { paymentMethod, amount, currency = 'USD' } = req.body;

  // Validate required fields
  if (!paymentMethod || !amount) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment method and amount are required');
  }

  // Process payment through payment service
  const paymentResult = await paymentService.processAppointmentPayment({
    appointmentId,
    userId: req.user._id,
    paymentMethod,
    amount,
    currency
  });

  res.status(httpStatus.OK).json(
    successResponse(paymentResult, 'Payment processed successfully')
  );
});

module.exports = {
  checkAvailability,
  getAppointments,
  getAppointmentById,
  simpleCreateAppointment,
  bookAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentsByPatient,
  getUpcomingAppointmentsUnified,
  getCompletedAndCancelledAppointments,
  changeAppointmentDoctor,
  getAllAppointments,
  getPublicAppointments,
  getCurrentMonthAppointments,
  getAvailableSlots,
  processPayment
};
