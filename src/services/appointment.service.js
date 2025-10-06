const moment = require('../config/timezone');
const dbManager = require('../db/dbManager');
const paymentService = require('./payment.service');
const appConfigService = require('./appConfig.service');
const userService = require('./user.service');
const streamService = require('./stream.service');
const realtimeService = require('./realtime.service');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const getAppointments = async (userId) => {
  const appointments = await dbManager.findMany('appointments', { user: userId }, ['doctor']);
  return appointments;
};

/**
 * Get Appointment by ID
 * @param {ObjectId} appointmentId
 * @returns {Promise<Appointment>}
 */
const getAppointmentById = async (appointmentId) => {
  return dbManager.findById('appointments', appointmentId, ['doctor', 'user']);
};

const checkAndSelectDoctorAvailability = async (doctorId, date, startTime, consultationType) => {
  let selectedDoctorId = doctorId;
  const queryDate = moment(date).startOf('day').toDate();

  if (!selectedDoctorId) {
    const availableDoctor = await dbManager.findAvailableDoctor(queryDate, startTime, consultationType);
    if (!availableDoctor || availableDoctor.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No available doctors at the specified time');
    }
    selectedDoctorId = availableDoctor[0].doctor_id;
  }

  // Calculate endTime by adding 30 minutes to startTime
  const startTimeMoment = moment(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm');
  const endTimeMoment = startTimeMoment.clone().add(30, 'minutes').subtract(1, 'seconds');
  const endTime = endTimeMoment.format('HH:mm:ss');

  // Check for conflicting appointments
  const conflictingAppointment = await dbManager.checkConflictingAppointment(
    selectedDoctorId,
    queryDate,
    startTime,
    endTime
  );

  if (conflictingAppointment) {
    throw new ApiError(httpStatus.CONFLICT, 'Time slot already booked');
  }

  return { selectedDoctorId, queryDate, startTime, endTime };
};

const createAppointmentAndInvoice = async (appointmentData, consultationPrice, consultationCurrency) => {
  const {
    userId, selectedDoctorId, queryDate, startTime, endTime, consultationType, symptoms, additionalNote, visitLocation
  } = appointmentData;

  const appointment = await dbManager.create('appointments', {
    user: userId,
    doctor: selectedDoctorId,
    date: queryDate,
    startTime,
    endTime,
    status: 'pending_payment',
    consultationType,
    symptoms,
    additionalNote,
    visitLocation
  });

  // Create invoice
  const invoice = await dbManager.create('invoices', {
    appointment: appointment.id,
    amount: consultationPrice,
    currency: consultationCurrency
  });

  // Emit real-time event for new appointment
  realtimeService.emitEvent('appointmentCreated', {
    appointmentId: appointment.id,
    appointment: appointment.toObject(),
    invoice: invoice.toObject(),
    timestamp: new Date()
  });

  return { appointment, invoice };
};

/**
 * Book an appointment
 * @param {Object} appointmentData
 * @returns {Object}
 */
const initiatePaymentProcess = async (invoice, apiConfig, doctorUser, customerUser, appointment) => {
  // Create payment request to MIPS
  const { payment_link } = await paymentService.createPaymentRequest(
    invoice,
    apiConfig.configs.payment.payment_link_exp_days,
    `Booking with Dr. ${doctorUser.name}`,
    customerUser
  );

  await dbManager.update('invoices', invoice.id, { mipsIdOrder: payment_link.mips_id_order, paymentLink: payment_link.url });

  // Emit real-time event for invoice update
  realtimeService.emitEvent('invoiceUpdated', {
    appointmentId: appointment.id,
    invoiceId: invoice.id,
    invoice: invoice.toObject(),
    timestamp: new Date()
  });

  return payment_link.url;
};

const bookAppointment = async (appointmentData) => {
  const {
    doctorId, date, startTime, userId, consultationType, symptoms = [], additionalNote, visitLocation
  } = appointmentData;

  const apiConfig = await appConfigService.getAppConfigByKey('API_CONFIG');

  const { selectedDoctorId, queryDate, endTime } = await checkAndSelectDoctorAvailability(
    doctorId, date, startTime, consultationType
  );

  const consultationPrice = apiConfig.configs.consultations[consultationType]?.price ?? 0;
  const consultationCurrency = apiConfig.configs.consultations[consultationType]?.currency ?? 'MUR';
  const [customerUser, doctorUser] = await Promise.all([
    userService.getUserById(userId),
    userService.getUserById(selectedDoctorId)
  ]);

  const { appointment, invoice } = await createAppointmentAndInvoice(
    { userId, selectedDoctorId, queryDate, startTime, endTime, consultationType, symptoms, additionalNote, visitLocation },
    consultationPrice,
    consultationCurrency
  );

  const paymentLink = await initiatePaymentProcess(invoice, apiConfig, doctorUser, customerUser, appointment);

  return { appointment, paymentLink };
};

/**
 * Update appointment status
 * @param {string} appointmentId - Appointment ID
 * @param {string} status - New status
 * @returns {Promise<Appointment>}
 */
const updateAppointmentStatus = async (appointmentId, status) => {
  // Validate status
  const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'pending_payment'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid status');
  }

  const appointment = await dbManager.findById('appointments', appointmentId);
  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Appointment not found');
  }

  // Update appointment status
  const updatedAppointment = await dbManager.update('appointments', appointmentId, { status });

  // Emit real-time event for appointment status update
  realtimeService.emitEvent('appointmentStatusUpdated', {
    appointmentId,
    status,
    timestamp: new Date()
  });

  return updatedAppointment;
};

/**
 * Cancel an appointment
 * @param {string} appointmentId - Appointment ID
 * @returns {Promise<Appointment>}
 */
const cancelAppointment = async (appointmentId) => {
  const appointment = await dbManager.findById('appointments', appointmentId);
  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Appointment not found');
  }

  // Update appointment status to cancelled
  const updatedAppointment = await dbManager.update('appointments', appointmentId, { status: 'cancelled' });

  // Emit real-time event for appointment cancellation
  realtimeService.emitEvent('appointmentCancelled', {
    appointmentId,
    timestamp: new Date()
  });

  return updatedAppointment;
};

/**
 * Get appointments by patient ID
 * @param {string} patientId - Patient ID
 * @returns {Promise<Array>}
 */
const getAppointmentsByPatientId = async (patientId) => {
  const appointments = await dbManager.findMany('appointments', { user: patientId }, ['doctor']);
  return appointments;
};

/**
 * Get upcoming appointments for a doctor
 * @param {string} doctorId - Doctor ID
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {Promise<Array>}
 */
const getUpcomingAppointments = async (doctorId, startDate, endDate) => {
  const filter = {
    doctor: doctorId,
    status: { neq: 'cancelled' }
  };

  // Add date filtering if provided
  if (startDate) {
    filter['date.gte'] = startDate;
  }

  if (endDate) {
    filter['date.lte'] = endDate;
  }

  const options = {
    sortBy: 'date:asc,start_time:asc',
    limit: 100 // Get all upcoming appointments
  };

  const result = await dbManager.paginate('appointments', filter, options);
  return result.results || result.docs || [];
};

/**
 * Get completed and cancelled appointments
 * @param {string} userId - User ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>}
 */
const getCompletedAndCancelledAppointments = async (userId, options) => {
  const filter = {
    user: userId,
    status: { in: ['completed', 'cancelled'] }
  };

  const paginationOptions = {
    sortBy: options.sortBy || 'created_at:desc',
    limit: options.limit ? parseInt(options.limit, 10) : 10,
    page: options.page ? parseInt(options.page, 10) : 1
  };

  const appointments = await dbManager.paginate('appointments', filter, paginationOptions);
  return appointments;
};

/**
 * Change appointment doctor
 * @param {string} appointmentId - Appointment ID
 * @param {string} newDoctorId - New doctor ID
 * @returns {Promise<Appointment>}
 */
const changeAppointmentDoctor = async (appointmentId, newDoctorId) => {
  const appointment = await dbManager.findById('appointments', appointmentId);
  if (!appointment) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Appointment not found');
  }

  // Check if new doctor exists and is a doctor
  const newDoctor = await userService.getUserById(newDoctorId);
  if (!newDoctor || newDoctor.role !== 'doctor') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid doctor');
  }

  // Update appointment with new doctor
  const updatedAppointment = await dbManager.update('appointments', appointmentId, {
    doctor: newDoctorId
  });

  // Emit real-time event for doctor change
  realtimeService.emitEvent('appointmentDoctorChanged', {
    appointmentId,
    newDoctorId,
    timestamp: new Date()
  });

  return updatedAppointment;
};

/**
 * Get all appointments with optional date filtering
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getAllAppointments = async (options) => {
  const filter = {};

  // Handle date range filtering using dot notation for Supabase adapter
  if (options.startDate) {
    // Ensure we're working with just the date part, no time or timezone
    const startDate = new Date(options.startDate);
    // Validate that the date is valid
    if (isNaN(startDate.getTime())) {
      throw new Error('Invalid startDate provided');
    }
    // Set start date to beginning of day in UTC
    startDate.setHours(0, 0, 0, 0);
    filter['date.gte'] = startDate.toISOString().split('T')[0];
  }

  if (options.endDate) {
    // Ensure we're working with just the date part, no time or timezone
    const endDate = new Date(options.endDate);
    // Validate that the date is valid
    if (isNaN(endDate.getTime())) {
      throw new Error('Invalid endDate provided');
    }
    // Set end date to end of day in UTC
    endDate.setHours(23, 59, 59, 999);
    filter['date.lte'] = endDate.toISOString().split('T')[0];
  }

  // Use default pagination options if not provided
  const paginationOptions = {
    sortBy: options.sortBy || 'created_at:desc',
    limit: options.limit ? parseInt(options.limit, 10) : 10,
    page: options.page ? parseInt(options.page, 10) : 1
  };

  const appointments = await dbManager.paginate('appointments', filter, paginationOptions);
  return appointments;
};

/**
 * Get Appointments with pagination
 * @param {string} userId - User ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>}
 */
const getAppointmentsWithPagination = async (userId, options) => {
  const filter = { user: userId };
  const paginationOptions = {
    sortBy: options.sortBy || 'created_at:desc',
    limit: options.limit ? parseInt(options.limit, 10) : 10,
    page: options.page ? parseInt(options.page, 10) : 1
  };

  const appointments = await dbManager.paginate('appointments', filter, paginationOptions);
  return appointments;
};


const createSimpleAppointment = async (appointmentData) => {
  const {
    doctor_id,
    patient_id,
    appointment_date,
    appointment_type,
    additional_note,
    timezone
  } = appointmentData;

  const appointment = await dbManager.create('appointments', {
    doctor: doctor_id,
    user: patient_id,
    date: appointment_date,
    consultation_type: appointment_type,
    additional_note,
    timezone,
    status: 'confirmed'
  });

  return appointment;
};

/**
 * Check doctor availability for a specific date
 * @param {string} doctorId - Doctor ID
 * @param {string} date - Date to check availability for (YYYY-MM-DD)
 * @returns {Promise<Object>} - Availability information
 */
const checkAvailability = async (doctorId, date) => {
  try {
    // Import logger here to avoid reference error
    const logger = require('../config/logger');

    // Validate inputs
    if (!doctorId) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Doctor ID is required');
    }

    if (!date) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Date is required');
    }

    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid date format');
    }

    // Format the date to YYYY-MM-DD
    const formattedDate = dateObj.toISOString().split('T')[0];

    // Check if doctor has availability for this date
    // First, get doctor's availabilities that include this date
    const startOfDay = new Date(formattedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(formattedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Query availabilities for the doctor that overlap with the requested date
    const availabilities = await dbManager.findMany('availabilities', {
      user_id: doctorId,
      $or: [
        // Non-recurring availabilities
        {
          is_recurring: false,
          start_date: { lte: endOfDay },
          end_date: { gte: startOfDay }
        },
        // Recurring availabilities
        {
          is_recurring: true,
          start_date: { lte: endOfDay },
          recurrence_end_date: { gte: startOfDay }
        }
      ]
    });

    // If no availabilities found, doctor is not available
    if (!availabilities || availabilities.length === 0) {
      return {
        available: false,
        reason: 'Doctor has no scheduled availability for this date',
        date: formattedDate,
        doctorId
      };
    }

    // Check if there are any appointments for this doctor on this date
    const appointments = await dbManager.findMany('appointments', {
      doctor: doctorId,
      date: formattedDate,
      status: { neq: 'cancelled' }
    });

    // Doctor is available if they have availability set and no conflicting appointments
    return {
      available: true,
      date: formattedDate,
      doctorId,
      availabilities: availabilities,
      appointmentCount: appointments ? appointments.length : 0
    };
  } catch (error) {
    const logger = require('../config/logger');
    logger.error('Error checking doctor availability:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to check availability');
  }
};

/**
 * Get all appointments for the current month
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getCurrentMonthAppointments = async (options) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const filter = {
    date: {
      gte: startOfMonth.toISOString().split('T')[0],
      lte: endOfMonth.toISOString().split('T')[0]
    }
  };

  // Use default pagination options if not provided
  const paginationOptions = {
    sortBy: options.sortBy || 'date:asc',
    limit: options.limit ? parseInt(options.limit, 10) : 10,
    page: options.page ? parseInt(options.page, 10) : 1
  };

  const appointments = await dbManager.paginate('appointments', filter, paginationOptions);
  return appointments;
};

module.exports = {
  createSimpleAppointment,
  getAppointments,
  getAppointmentsWithPagination,
  getAppointmentById,
  bookAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getAppointmentsByPatientId,
  getUpcomingAppointments,
  getCompletedAndCancelledAppointments,
  changeAppointmentDoctor,
  getAllAppointments,
  checkAvailability,
  getCurrentMonthAppointments
};
