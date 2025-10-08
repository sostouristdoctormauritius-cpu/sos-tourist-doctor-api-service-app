const { User } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

/**
 * Create a patient (user with role 'user')
 * @param {Object} patientBody
 * @returns {Promise<User>}
 */
const createPatient = async (patientBody) => {
  try {
    // Ensure role is set to 'user' for patients
    const patientData = {
      ...patientBody,
      role: 'user'
    };

    const patient = await User.create(patientData);
    return patient;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');
    }
    throw error;
  }
};

/**
 * Query for patients (users with role 'patient')
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryPatients = async (filter, options) => {
  // Default filter to only get users with role 'patient'
  const patientFilter = {
    ...filter,
    role: 'patient'
  };

  const patients = await User.paginate(patientFilter, options);
  return patients;
};

/**
 * Get patient by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getPatientById = async (id) => {
  return User.findOne({ _id: id, role: 'user' });
};

/**
 * Get patient by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getPatientByEmail = async (email) => {
  return User.findOne({ email, role: 'user' });
};

/**
 * Update patient by id
 * @param {ObjectId} patientId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updatePatient = async (patientId, updateBody) => {
  const patient = await getPatientById(patientId);
  if (!patient) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  }

  try {
    Object.assign(patient, updateBody);
    await patient.save();
    return patient;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');
    }
    throw error;
  }
};

/**
 * Delete patient by id
 * @param {ObjectId} patientId
 * @returns {Promise<User>}
 */
const deletePatient = async (patientId) => {
  const patient = await getPatientById(patientId);
  if (!patient) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Patient not found');
  }
  await patient.remove();
  return patient;
};

module.exports = {
  createPatient,
  queryPatients,
  getPatientById,
  getPatientByEmail,
  updatePatient,
  deletePatient,
};
