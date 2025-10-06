const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const logger = require('../config/logger');
const dbManager = require('../db/dbManager');

const getDoctors = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'specialization']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  // Ensure we only get doctors
  filter.role = 'doctor';

  // Only get listed doctors
  filter['doctor_profile->>is_listed'] = true;

  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getDoctor = catchAsync(async (req, res) => {
  const doctor = await userService.getUserById(req.params.doctorId);

  if (!doctor || doctor.role !== 'doctor') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
  }

  res.send(doctor);
});

const updateDoctor = catchAsync(async (req, res) => {
  const doctor = await userService.updateUserById(req.params.doctorId, req.body);

  if (!doctor || doctor.role !== 'doctor') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
  }

  res.send(doctor);
});

const deleteDoctor = catchAsync(async (req, res) => {
  const doctor = await userService.archiveUserById(req.params.doctorId);

  if (!doctor || doctor.role !== 'doctor') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
  }

  res.status(httpStatus.NO_CONTENT).send();
});

const createDoctor = catchAsync(async (req, res) => {
  // Ensure role is set to doctor
  req.body.role = 'doctor';

  const doctor = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(doctor);
});

// New function to get all doctors (including unlisted ones) for admin management
const getAllDoctors = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'specialization', 'isListed']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  // Ensure we only get doctors
  filter.role = 'doctor';

  // Handle isListed filter
  if (filter.isListed !== undefined) {
    filter['doctor_profile->>is_listed'] = filter.isListed === 'true';
    delete filter.isListed;
  }

  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

// New function to get doctor statistics
const getDoctorStats = catchAsync(async (req, res) => {
  try {
    // Get total number of doctors
    const totalDoctors = await dbManager.count('users', { role: 'doctor' });

    // Get listed doctors count
    const listedDoctors = await dbManager.count('users', {
      role: 'doctor',
      'doctor_profile->>is_listed': true
    });

    // Get doctors by specialization
    // Note: This is a simplified approach - in a real implementation,
    // you might want to use the aggregate function
    const allDoctors = await dbManager.findMany('users', { role: 'doctor' });
    const specializationCounts = {};

    allDoctors.forEach(doctor => {
      if (doctor.doctor_profile && doctor.doctor_profile.specialisation) {
        const spec = doctor.doctor_profile.specialisation;
        specializationCounts[spec] = (specializationCounts[spec] || 0) + 1;
      }
    });

    res.status(httpStatus.OK).send({
      totalDoctors,
      listedDoctors,
      unlistedDoctors: totalDoctors - listedDoctors,
      specializations: specializationCounts
    });
  } catch (error) {
    logger.error('Error fetching doctor stats:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch doctor statistics');
  }
});

// New function to toggle doctor listing status
const toggleDoctorListing = catchAsync(async (req, res) => {
  const { doctorId } = req.params;
  const { isListed } = req.body;

  // Validate input
  if (typeof isListed !== 'boolean') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'isListed must be a boolean value');
  }

  // Get the doctor
  const doctor = await userService.getUserById(doctorId);

  if (!doctor || doctor.role !== 'doctor') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
  }

  // Update the doctor's listing status
  const updatedDoctor = await userService.updateUserById(doctorId, {
    doctor_profile: {
      ...doctor.doctor_profile,
      is_listed: isListed
    }
  });

  res.status(httpStatus.OK).send({
    success: true,
    message: `Doctor ${isListed ? 'listed' : 'unlisted'} successfully`,
    doctor: updatedDoctor
  });
});

module.exports = {
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  createDoctor,
  getAllDoctors,
  getDoctorStats,
  toggleDoctorListing
};
