const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { successResponse } = require('../utils/apiResponse');
const { pick } = require('../utils/pick');
const invoiceService = require('../services/invoice.service');

const createInvoice = catchAsync(async (req, res) => {
  const invoice = await invoiceService.createInvoice(req.body);
  res.status(httpStatus.CREATED).json(successResponse(invoice, 'Invoice created successfully'));
});

const getInvoices = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['patient', 'doctor', 'status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await invoiceService.queryInvoices(filter, options);
  res.status(httpStatus.OK).json(successResponse(result, 'Invoices retrieved successfully'));
});

const getInvoice = catchAsync(async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(req.params.invoiceId);
  if (!invoice) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invoice not found');
  }
  res.status(httpStatus.OK).json(successResponse(invoice, 'Invoice retrieved successfully'));
});

const updateInvoice = catchAsync(async (req, res) => {
  const invoice = await invoiceService.updateInvoiceById(req.params.invoiceId, req.body);
  res.status(httpStatus.OK).json(successResponse(invoice, 'Invoice updated successfully'));
});

const deleteInvoice = catchAsync(async (req, res) => {
  await invoiceService.deleteInvoiceById(req.params.invoiceId);
  res.status(httpStatus.OK).json(successResponse(null, 'Invoice deleted successfully'));
});

const getInvoicesByRole = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  let userId;
  let role;

  if (req.params.userId) {
    userId = req.params.userId;
    role = req.params.role;
  } else if (req.user) {
    userId = req.user.id;
    role = req.user.role;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User ID or role not specified');
  }

  const result = await invoiceService.getInvoicesByUser(userId, role, options);

  // Standardize pagination response format
  const response = {
    results: result.results || [],
    page: result.page || result.currentPage || 1,
    limit: result.limit || 10,
    totalPages: result.totalPages || 0,
    totalResults: result.totalResults || 0
  };

  res.status(httpStatus.OK).json(successResponse(response, 'Invoices retrieved successfully'));
});

const getAllInvoices = catchAsync(async (req, res) => {
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await invoiceService.getAllInvoices(options);

  // Standardize pagination response format
  const response = {
    results: result.results || [],
    page: result.page || result.currentPage || 1,
    limit: result.limit || 10,
    totalPages: result.totalPages || 0,
    totalResults: result.totalResults || 0
  };

  res.status(httpStatus.OK).json(successResponse(response, 'All invoices retrieved successfully'));
});

module.exports = {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoicesByRole,
  getAllInvoices
};
