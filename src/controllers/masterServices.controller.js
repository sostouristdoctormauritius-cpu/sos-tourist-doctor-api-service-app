const { status } = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { masterServicesService } = require('../services');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const getAllServices = catchAsync(async (req, res) => {
  const options = {
    category: req.query.category,
    isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
    sortBy: req.query.sortBy || 'name:asc',
    limit: parseInt(req.query.limit, 10) || 50,
    page: parseInt(req.query.page, 10) || 1
  };

  logger.info('Getting all master services', { options });

  const result = await masterServicesService.queryServices(options);

  res.status(status.OK).send({
    services: result.services,
    pagination: result.pagination,
    message: 'Master services retrieved successfully'
  });
});

const getServiceById = catchAsync(async (req, res) => {
  const { serviceId } = req.params;

  logger.info('Getting master service by ID', { serviceId });

  const service = await masterServicesService.getServiceById(serviceId);

  if (!service) {
    throw new ApiError(status.NOT_FOUND, 'Master service not found');
  }

  res.status(status.OK).send({
    service,
    message: 'Master service retrieved successfully'
  });
});

const createService = catchAsync(async (req, res) => {
  const { name, description, category, price, duration, isActive = true, imageUrl } = req.body;

  if (!name || !category || price === undefined) {
    throw new ApiError(status.BAD_REQUEST, 'Name, category, and price are required');
  }

  logger.info('Creating master service', { name, category, price });

  const service = await masterServicesService.createService({
    name,
    description,
    category,
    price,
    duration,
    isActive,
    imageUrl
  });

  res.status(status.CREATED).send({
    service,
    message: 'Master service created successfully'
  });
});

const updateService = catchAsync(async (req, res) => {
  const { serviceId } = req.params;
  const updateData = req.body;

  logger.info('Updating master service', { serviceId, updateData });

  const service = await masterServicesService.updateService(serviceId, updateData);

  if (!service) {
    throw new ApiError(status.NOT_FOUND, 'Master service not found');
  }

  res.status(status.OK).send({
    service,
    message: 'Master service updated successfully'
  });
});

const deleteService = catchAsync(async (req, res) => {
  const { serviceId } = req.params;

  logger.info('Deleting master service', { serviceId });

  const service = await masterServicesService.deleteService(serviceId);

  if (!service) {
    throw new ApiError(status.NOT_FOUND, 'Master service not found');
  }

  res.status(status.OK).send({
    service,
    message: 'Master service deleted successfully'
  });
});

const getServiceCategories = catchAsync(async (req, res) => {
  logger.info('Getting service categories');

  const categories = await masterServicesService.getServiceCategories();

  res.status(status.OK).send({
    categories,
    message: 'Service categories retrieved successfully'
  });
});

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServiceCategories
};
