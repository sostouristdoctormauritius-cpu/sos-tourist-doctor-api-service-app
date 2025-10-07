const { status } = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { adminService } = require('../services');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const createAdmin = catchAsync(async (req, res) => {
  const adminData = req.body;

  logger.info('Creating admin', { email: adminData.email });

  const admin = await adminService.createAdmin(adminData);

  res.status(status.CREATED).send({
    admin,
    message: 'Admin created successfully'
  });
});

const getAdmins = catchAsync(async (req, res) => {
  const options = {
    name: req.query.name,
    role: req.query.role,
    isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
    sortBy: req.query.sortBy,
    limit: parseInt(req.query.limit, 10) || 10,
    page: parseInt(req.query.page, 10) || 1
  };

  logger.info('Getting admins', { options });

  const result = await adminService.queryAdmins(options);

  res.status(status.OK).send({
    admins: result.admins,
    pagination: result.pagination,
    message: 'Admins retrieved successfully'
  });
});

const getAdmin = catchAsync(async (req, res) => {
  const { adminId } = req.params;

  logger.info('Getting admin by ID', { adminId });

  const admin = await adminService.getAdminById(adminId);

  if (!admin) {
    throw new ApiError(status.NOT_FOUND, 'Admin not found');
  }

  res.status(status.OK).send({
    admin,
    message: 'Admin retrieved successfully'
  });
});

const updateAdmin = catchAsync(async (req, res) => {
  const { adminId } = req.params;
  const updateData = req.body;

  logger.info('Updating admin', { adminId, updateData });

  const admin = await adminService.updateAdmin(adminId, updateData);

  if (!admin) {
    throw new ApiError(status.NOT_FOUND, 'Admin not found');
  }

  res.status(status.OK).send({
    admin,
    message: 'Admin updated successfully'
  });
});

const deleteAdmin = catchAsync(async (req, res) => {
  const { adminId } = req.params;

  logger.info('Deleting admin', { adminId });

  const admin = await adminService.deleteAdmin(adminId);

  if (!admin) {
    throw new ApiError(status.NOT_FOUND, 'Admin not found');
  }

  res.status(status.OK).send({
    admin,
    message: 'Admin deleted successfully'
  });
});

module.exports = {
  createAdmin,
  getAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin
};
