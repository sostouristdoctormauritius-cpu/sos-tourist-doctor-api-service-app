const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const dbManager = require('../db/dbManager');

/**
 * Create a admin
 * @param {Object} adminBody
 * @returns {Promise<Admin>}
 */
const createAdmin = async (adminBody) => {
  try {
    const admin = await dbManager.create('admins', adminBody);
    return admin;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');
    }
    throw error;
  }
};

/**
 * Query for admins
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryAdmins = async (filter, options) => {
  const admins = await dbManager.paginate('admins', filter, options);
  return admins;
};

/**
 * Get admin by id
 * @param {ObjectId} id
 * @returns {Promise<Admin>}
 */
const getAdminById = async (id) => {
  return dbManager.findById('admins', id);
};

/**
 * Get admin by email
 * @param {string} email
 * @returns {Promise<Admin>}
 */
const getAdminByEmail = async (email) => {
  return dbManager.findOne('admins', { email });
};

/**
 * Update admin by id
 * @param {ObjectId} adminId
 * @param {Object} updateBody
 * @returns {Promise<Admin>}
 */
const updateAdmin = async (adminId, updateBody) => {
  const admin = await getAdminById(adminId);
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }

  try {
    const updatedAdmin = await dbManager.updateById('admins', adminId, updateBody);
    return updatedAdmin;
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already exists');
    }
    throw error;
  }
};

/**
 * Delete admin by id
 * @param {ObjectId} adminId
 * @returns {Promise<Admin>}
 */
const deleteAdmin = async (adminId) => {
  const admin = await getAdminById(adminId);
  if (!admin) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  }
  await dbManager.deleteById('admins', adminId);
  return admin;
};

module.exports = {
  createAdmin,
  queryAdmins,
  getAdminById,
  getAdminByEmail,
  updateAdmin,
  deleteAdmin,
};
