const dbManager = require('../db/dbManager');
const streamService = require('./stream.service');
const userService = require('./user.service');
const logger = require('../config/logger');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

/**
 * Get all invoices for admin with appointment, doctor, and user details
 * @param {Object} options - Query options
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<Object>}
 */
const getInvoices = async (options) => {
  try {
    const result = await dbManager.paginate('invoices', {}, options);
    const invoices = result.docs || result.results || [];

    // Fetch related appointments and users
    const appointmentIds = [...new Set(invoices.map(invoice => invoice.appointment).filter(Boolean))];

    let appointments = [];
    let appointmentMap = new Map();

    if (appointmentIds.length > 0) {
      appointments = await dbManager.findMany('appointments', { id: { in: appointmentIds } });
      appointmentMap = new Map(appointments.map(app => [app.id, app]));
    }

    const userIds = [...new Set(appointments.flatMap(app => [app.user, app.doctor]).filter(Boolean))];

    let users = [];
    let userMap = new Map();

    if (userIds.length > 0) {
      users = await dbManager.findMany('users', { id: { in: userIds } });
      userMap = new Map(users.map(user => [user.id, user]));
    }

    // Manually join the data
    const joinedInvoices = invoices.map(invoice => {
      const appointment = appointmentMap.get(invoice.appointment);
      if (!appointment) return invoice; // Return invoice without appointment if not found

      const user = userMap.get(appointment.user);
      const doctor = userMap.get(appointment.doctor);

      return {
        ...invoice,
        appointment: {
          ...appointment,
          user: user,
          doctor: doctor
        }
      };
    });

    return {
      results: joinedInvoices || [],
      totalResults: result.totalResults || result.totalDocs || 0,
      totalDocs: result.totalResults || result.totalDocs || 0,
      limit: result.limit,
      page: result.currentPage || result.page || 1,
      currentPage: result.currentPage || result.page || 1,
      totalPages: result.totalPages || 0,
      hasNextPage: result.hasNextPage || false,
      hasPrevPage: result.hasPrevPage || false
    };
  } catch (error) {
    logger.error('Error in getInvoices:', error);
    // Return empty structure on error
    return {
      results: [],
      totalResults: 0,
      totalDocs: 0,
      limit: options.limit || 10,
      page: options.page || 1,
      currentPage: options.page || 1,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false
    };
  }
};

const getInvoicesByUser = async (userId, role, options) => {
  try {
    // Build query based on role
    let appointmentFilter = {};
    if (role === 'doctor') {
      appointmentFilter = { doctor: userId };
    } else { // Assuming 'user' or 'patient' role
      appointmentFilter = { user: userId };
    }

    // Fetch appointments related to the user/doctor
    const appointments = await dbManager.findMany('appointments', appointmentFilter);
    const appointmentIds = appointments.map(app => app.id);

    if (appointmentIds.length === 0) {
      return {
        results: [],
        totalResults: 0,
        totalDocs: 0,
        limit: options.limit || 10,
        page: options.page || 1,
        currentPage: options.page || 1,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      };
    }

    // Fetch invoices with the query
    const result = await dbManager.paginate('invoices', { appointment: { in: appointmentIds } }, options);
    const invoices = result.results || result.docs || [];

    // Fetch related appointments and users (similar to getInvoices)
    const allAppointmentIds = [...new Set(invoices.map(invoice => invoice.appointment).filter(Boolean))];

    let allAppointments = [];
    let appointmentMap = new Map();

    if (allAppointmentIds.length > 0) {
      allAppointments = await dbManager.findMany('appointments', { id: { in: allAppointmentIds } });
      appointmentMap = new Map(allAppointments.map(app => [app.id, app]));
    }

    const userIds = [...new Set(allAppointments.flatMap(app => [app.user, app.doctor]).filter(Boolean))];

    let users = [];
    let userMap = new Map();

    if (userIds.length > 0) {
      users = await dbManager.findMany('users', { id: { in: userIds } });
      userMap = new Map(users.map(user => [user.id, user]));
    }

    // Manually join the data
    const joinedInvoices = invoices.map(invoice => {
      const appointment = appointmentMap.get(invoice.appointment);
      if (!appointment) return invoice;

      const user = userMap.get(appointment.user);
      const doctor = userMap.get(appointment.doctor);

      return {
        ...invoice,
        appointment: {
          ...appointment,
          user: user,
          doctor: doctor
        }
      };
    });

    return {
      results: joinedInvoices || [],
      totalResults: result.totalResults || result.totalDocs || 0,
      totalDocs: result.totalResults || result.totalDocs || 0,
      limit: result.limit,
      page: result.currentPage || result.page || 1,
      currentPage: result.currentPage || result.page || 1,
      totalPages: result.totalPages || 0,
      hasNextPage: result.hasNextPage || false,
      hasPrevPage: result.hasPrevPage || false
    };
  } catch (error) {
    logger.error('Error in getInvoicesByUser:', error);
    // Return empty structure on error
    return {
      results: [],
      totalResults: 0,
      totalDocs: 0,
      limit: options.limit || 10,
      page: options.page || 1,
      currentPage: options.page || 1,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false
    };
  }
};

/**
 * Get invoice by ID
 * @param {string} invoiceId
 * @returns {Promise<Invoice>}
 */
const getInvoiceById = async (invoiceId) => {
  return dbManager.findById('invoices', invoiceId);
};

/**
 * Delete invoice
 * @param {string} invoiceId
 * @returns {Promise<Invoice>}
 */
const deleteInvoice = async (invoiceId) => {
  return dbManager.delete('invoices', invoiceId);
};

/**
 * Update invoice by id
 * @param {string} invoiceId
 * @param {Object} updateBody
 * @returns {Promise<Invoice>}
 */
const updateInvoice = async (invoiceId, updateBody) => {
  const invoice = await dbManager.findById('invoices', invoiceId);
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
  }

  // Map camelCase fields to snake_case for database
  const updateData = {
    appointment_id: updateBody.appointment_id,
    amount: updateBody.amount,
    currency: updateBody.currency,
    details: updateBody.details,
    status: updateBody.status,
    mips_id_order: updateBody.mips_id_order,
    payment_link: updateBody.payment_link
  };

  const updatedInvoice = await dbManager.update('invoices', invoiceId, updateData);
  return updatedInvoice;
};

/**
 * Create a new invoice
 * @param {Object} invoiceBody
 * @returns {Promise<Invoice>}
 */
const createInvoice = async (invoiceBody) => {
  // Map camelCase fields to snake_case for database
  const invoiceData = {
    appointment_id: invoiceBody.appointment_id,
    amount: invoiceBody.amount,
    currency: invoiceBody.currency,
    details: invoiceBody.details,
    status: invoiceBody.status,
    mips_id_order: invoiceBody.mips_id_order,
    payment_link: invoiceBody.payment_link
  };

  return dbManager.create('invoices', invoiceData);
};

/**
 * Get all invoices for admin with pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const getAllInvoices = async (options) => {
  try {
    const result = await dbManager.paginate('invoices', {}, options);
    return result;
  } catch (error) {
    logger.error('Error in getAllInvoices:', error);
    // Return empty structure on error
    return {
      results: [],
      totalResults: 0,
      totalDocs: 0,
      limit: options.limit || 10,
      page: options.page || 1,
      currentPage: options.page || 1,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false
    };
  }
};

/**
 * Update invoice by id
 * @param {string} invoiceId
 * @param {Object} updateBody
 * @returns {Promise<Invoice>}
 */
const updateInvoiceById = async (invoiceId, updateBody) => {
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
  }
  const updatedInvoice = await dbManager.update('invoices', invoiceId, updateBody);
  return updatedInvoice;
};

/**
 * Delete invoice by id
 * @param {string} invoiceId
 * @returns {Promise<Invoice>}
 */
const deleteInvoiceById = async (invoiceId) => {
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
  }
  const deletedInvoice = await dbManager.delete('invoices', invoiceId);
  return deletedInvoice;
};

/**
 * Query invoices with filter
 * @param {Object} filter - Filter options
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const queryInvoices = async (filter, options) => {
  const result = await dbManager.paginate('invoices', filter, options);
  return result;
};

module.exports = {
  createInvoice,
  getInvoices,
  getInvoicesByUser,
  getInvoiceById,
  deleteInvoice,
  updateInvoice,
  getAllInvoices,
  updateInvoiceById,
  deleteInvoiceById,
  queryInvoices
};
