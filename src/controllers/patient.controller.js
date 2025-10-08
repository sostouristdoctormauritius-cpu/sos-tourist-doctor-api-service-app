const { status } = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { patientService } = require('../services');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const createPatient = catchAsync(async (req, res) => {
  const patientData = req.body;

  logger.info('Creating patient', { email: patientData.email });

  const patient = await patientService.createPatient(patientData);

  res.status(status.CREATED).send({
    patient,
    message: 'Patient created successfully'
  });
});

const getPatients = catchAsync(async (req, res) => {
  const options = {
    name: req.query.name,
    role: req.query.role,
    isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
    sortBy: req.query.sortBy,
    limit: parseInt(req.query.limit, 10) || 10,
    page: parseInt(req.query.page, 10) || 1
  };

  logger.info('Getting patients', { options });

  const result = await patientService.queryPatients(options);

  res.status(status.OK).send({
    patients: result.patients,
    pagination: result.pagination,
    message: 'Patients retrieved successfully'
  });
});

const getPatient = catchAsync(async (req, res) => {
  const { patientId } = req.params;

  logger.info('Getting patient by ID', { patientId });

  const patient = await patientService.getPatientById(patientId);

  if (!patient) {
    throw new ApiError(status.NOT_FOUND, 'Patient not found');
  }

  res.status(status.OK).send({
    patient,
    message: 'Patient retrieved successfully'
  });
});

const updatePatient = catchAsync(async (req, res) => {
  const { patientId } = req.params;
  const updateData = req.body;

  logger.info('Updating patient', { patientId, updateData });

  const patient = await patientService.updatePatient(patientId, updateData);

  if (!patient) {
    throw new ApiError(status.NOT_FOUND, 'Patient not found');
  }

  res.status(status.OK).send({
    patient,
    message: 'Patient updated successfully'
  });
});

const deletePatient = catchAsync(async (req, res) => {
  const { patientId } = req.params;

  logger.info('Deleting patient', { patientId });

  const patient = await patientService.deletePatient(patientId);

  if (!patient) {
    throw new ApiError(status.NOT_FOUND, 'Patient not found');
  }

  res.status(status.OK).send({
    patient,
    message: 'Patient deleted successfully'
  });
});

module.exports = {
  createPatient,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient
};
