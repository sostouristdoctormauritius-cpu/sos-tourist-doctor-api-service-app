const bcrypt = require('bcryptjs');
const httpStatus = require('http-status');
const dbManager = require('../db/dbManager');

const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');
const streamService = require('./stream.service');
const emailService = require('./email.service');
const config = require('../config/config');
const moment = require('../config/timezone');
const realtimeService = require('./realtime.service');
const crypto = require('crypto');
const otpService = require('./otp.service');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  logger.info('createUser called', { userBody });

  if (await isEmailTaken(userBody.email)) {
    logger.warn('Email already taken', { email: userBody.email });
    throw new ApiError(httpStatus.BAD_REQUEST, `Your profile is incomplete, Try to login with ${userBody.email}`);
  }

  // Only check phone if it's provided
  if (userBody.phone) {
    if (await isPhoneTaken(userBody.phone)) {
      logger.warn('Phone already taken', { phone: userBody.phone });
      throw new ApiError(httpStatus.BAD_REQUEST, 'Phone already taken');
    }
    userBody.phone = userBody.phone.trim();
  }

  logger.info('Creating user in database', { userBody });
  try {
    const user = await dbManager.create('users', userBody);
    await streamService.createUser(user);

    // Emit real-time event for new user
    realtimeService.emitEvent('userCreated', {
      userId: user.id,
      user: user,
      timestamp: new Date()
    });

    return user;
  } catch (error) {
    logger.error('Error creating user in database', {
      error: error.message,
      stack: error.stack,
      userBody
    });

    // Re-throw the error with more context
    throw new Error(`Failed to create user in database: ${error.message}`);
  }
};

/**
 * Query for active users
 * @param {Object} filter - Database filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const finalFilter = { ...filter };

  // Handle isArchived filter
  finalFilter.is_archived = { neq: true };

  // Handle name search with ilike on name and email
  if (finalFilter.name) {
    finalFilter.$or = [
      { name: { ilike: `%${finalFilter.name}%` } },
      { email: { ilike: `%${finalFilter.name}%` } }
    ];
    delete finalFilter.name; // Remove original name filter
  }

  const users = await dbManager.paginate('users', finalFilter, options);
  return users;
};

/**
 * Query for doctors with enhanced filtering
 * @param {Object} filter - Filter object
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryDoctors = async (filter, options) => {
  const doctorFilter = {
    role: 'doctor',
    is_archived: { neq: true },
    ...filter
  };

  // Ensure doctors are listed
  if (doctorFilter['doctor_profile->>is_listed'] === undefined) {
    doctorFilter['doctor_profile->>is_listed'] = true;
  }

  const doctors = await dbManager.paginate('users', doctorFilter, options);
  return doctors;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return dbManager.findById('users', id);
};

/**
 * Get active user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getActiveUserById = async (id) => {
  return dbManager.findOne('users', { id, isArchived: false });
};

/**
 * Get doctors
 * @returns {Promise<User[]>}
 */
const getDoctors = async () => {
  return dbManager.findMany('users', { role: 'doctor' });
};

/**
 * Get users
 * @returns {Promise<User[]>}
 */
const getUsers = async () => {
  return dbManager.findMany('users', {});
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<QueryResult>}
 */
const getUserByEmail = async (email, includeArchived = false) => {
  logger.info('getUserByEmail called', { email, includeArchived });

  const filter = { email };
  if (!includeArchived) {
    filter.is_archived = false;
  }

  logger.info('getUserByEmail filter', { filter });
  const result = await dbManager.findOne('users', filter);
  logger.info('getUserByEmail result', { email, found: !!result, result: result ? { id: result.id, email: result.email, role: result.role, is_archived: result.is_archived } : null });

  return result;
};

const getUserByPhone = async (phone, includeArchived = false) => {
  const filter = { phone };
  if (!includeArchived) {
    filter.is_archived = false;
  }
  return dbManager.findOne('users', filter);
};

/**
 * Get active user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
// const getActiveUserByEmail = async (email) => {
//   return User.findOne({ email, isArchived: false  });
// };
/**
 * Get active user by email or phone
 * @param {string} username
 * @returns {Promise<User>}
 */
const getActiveUserByEmailOrPhone = async (username) => {
  logger.info('getActiveUserByEmailOrPhone called with:', username);
  logger.info('Querying users table with:', {
    is_archived: false,
    $or: [
      { email: username },
      { phone: username }
    ]
  });

  try {
    const result = await dbManager.findOne('users', {
      is_archived: false,
      $or: [
        { email: username },
        { phone: username }
      ]
    }, ['*']); // Include all fields

    logger.info('Found user:', result ? result.id : 'None');
    return result;
  } catch (error) {
    logger.error('Error in getActiveUserByEmailOrPhone:', error);
    logger.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
};



/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @param {boolean} [isActiveCheck=false] - Whether to check for active user only
 * @returns {Promise<User>}
 */
const updateUser = async (userId, updateBody, isActiveCheck = false) => {
  const user = isActiveCheck ? await getActiveUserById(userId) : await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await dbManager.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  // Handle doctorProfile.supportedLanguages separately
  if (updateBody.doctorProfile && updateBody.doctorProfile.supportedLanguages) {
    if (!user.doctorProfile) {
      user.doctorProfile = {}; // Initialize doctorProfile if it doesn't exist
    }
    user.doctorProfile.supportedLanguages =
      updateBody.doctorProfile.supportedLanguages;
    // No need for markModified with dbManager.update
    delete updateBody.doctorProfile.supportedLanguages; // Prevent merging issues
  }

  // Merge remaining updateBody fields into user object
  const updatedUser = { ...user, ...updateBody };

  await dbManager.update('users', userId, updatedUser);

  // Emit real-time event for user update
  realtimeService.emitEvent('userUpdated', {
    userId: user.id,
    user: updatedUser,
    timestamp: new Date()
  });

  return updatedUser;
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  return updateUser(userId, updateBody, false);
};

/**
 * Archive user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const archiveUserById = async (userId) => {
  const user = await dbManager.findById('users', userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const [localPart, domain] = user.email.split('@');
  const updatedUser = {
    phone: `${localPart}_archived_${Date.now()}@${domain}`,
    email: `${localPart}_archived_${Date.now()}@${domain}`,
    isArchived: true,
    archivedAt: Date.now(),
    deletionRequestToken: null,
    deletionRequestExpires: null
  };

  await dbManager.update('users', userId, updatedUser);

  // Emit real-time event for user archive
  realtimeService.emitEvent('userArchived', {
    userId: user.id,
    user: user,
    timestamp: new Date()
  });

  return user;
};

/**
 * Update active user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateActiveUserById = async (userId, updateBody) => {
  return updateUser(userId, updateBody, true);
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await dbManager.findById('users', userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  await dbManager.delete('users', userId);

  // Emit real-time event for user deletion
  realtimeService.emitEvent('userDeleted', {
    userId: user.id,
    user: user,
    timestamp: new Date()
  });

  return user;
};

/**
 * Check if email is taken
 * @param {string} email
 * @param {string} excludeUserId
 * @returns {Promise<boolean>}
 */
const isEmailTaken = async (email, excludeUserId) => {
  logger.info('isEmailTaken called', { email, excludeUserId });
  const filter = { email };
  if (excludeUserId) {
    filter.id = { $ne: excludeUserId };
  }

  const user = await dbManager.findOne('users', filter);
  const result = !!user;
  logger.info('isEmailTaken result', { email, result });
  return result;
};

/**
 * Check if phone is taken
 * @param {string} phone
 * @param {string} excludeUserId
 * @returns {Promise<boolean>}
 */
const isPhoneTaken = async (phone, excludeUserId) => {
  logger.info('isPhoneTaken called', { phone, excludeUserId });
  if (!phone) {
    logger.info('isPhoneTaken: phone is null or empty, returning false');
    return false;
  }

  const filter = { phone };
  if (excludeUserId) {
    filter.id = { $ne: excludeUserId };
  }

  const user = await dbManager.findOne('users', filter);
  const result = !!user;
  logger.info('isPhoneTaken result', { phone, result });
  return result;
};

/**
 * Paginate users
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const paginate = async (filter, options) => {
  const users = await dbManager.paginate('users', filter, options);
  return users;
};

/**
 * Date user's profile picture URL
 * @param {ObjectId} userId
 * @param {String} profilePictureUrl
 * @returns {Promise<User>}
 */
const updateUserProfilePicture = async (userId, profilePictureUrl) => {
  const user = await dbManager.findById('users', userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const updatedFields = {
    userProfile: {
      ...user.userProfile,
      profilePicture: profilePictureUrl
    }
  };

  await dbManager.update('users', userId, updatedFields);
  return { ...user, ...updatedFields }; // Return updated user object
};

const sendInvitation = async (name, email, role) => {
  if (await getUserByEmail(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already exists');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiration = Date.now() + 3600000 * config.userInvitationExpiryHours;

  // Create the new user in an invited state
  const user = await dbManager.create('users', {
    name,
    email,
    role,
    invitationToken: token,
    invitationExpires: expiration,
    isInvitation: true,
    isEmailVerified: false,
    doctorProfile: {
      specialisation: 'General Practitioner'
    }
  });

  // Send the invitation email with the token
  await emailService.sendInvitationEmail(email, token, role);
};

const registerInvitedUser = async (token, password) => {
  const user = await dbManager.findOne('users', {
    invitationToken: token,
    invitationExpires: { gt: Date.now() },
    isInvitation: true
  });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired token');
  }

  // Update user details
  const updatedUser = {
    password: password,
    isInvitation: false,
    isEmailVerified: true,
    invitationToken: null,
    invitationExpires: null
  };

  await dbManager.update('users', user.id, updatedUser);
};

const requestDeletion = async (email) => {
  const user = await dbManager.findOne('users', { email });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = moment()
    .add(config.userDeletionRequestExpiryHours, 'hours')
    .toDate();

  const updatedUser = {
    deletionRequestToken: token,
    deletionRequestExpires: expires
  };

  await dbManager.update('users', user.id, updatedUser);

  await emailService.sendDeletionRequestEmail(user.email, token);
};

const completeDeletion = async (token) => {
  const user = await dbManager.findOne('users', {
    deletionRequestToken: token,
    deletionRequestExpires: { gt: new Date() } // Ensure token is not expired
  });

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired token');
  }

  await archiveUserById(user.id);
};

const deleteOtpsByUserId = async (userId) => {
  // Implementation would go here
  logger.info('deleteOtpsByUserId called with userId:', userId);
  // For now, we'll just return a resolved promise
  return Promise.resolve();
};

const createOtp = async (userId, otpCode, expiresAt) => {
  logger.info('createOtp called with:', { userId, otpCode, expiresAt });
  // For now, we'll just return a mock OTP object
  return Promise.resolve({
    userId,
    otp: otpCode,
    expiresAt
  });
};

const getUserCount = async () => {
  const count = await dbManager.count('users', {});
  return count;
};

const getDoctorCount = async () => {
  const count = await dbManager.count('users', { role: 'doctor' });
  return count;
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getActiveUserById,
  getActiveUserByEmailOrPhone,
  getDoctors,
  getUsers,
  updateUserById,
  updateActiveUserById,
  deleteUserById,
  isEmailTaken,
  isPhoneTaken,
  paginate,
  queryDoctors,
  getUserByEmail,
  getUserByPhone,
  getUserCount,
  getDoctorCount,
  archiveUserById,
  sendInvitation,
  registerInvitedUser,
  requestDeletion,
  completeDeletion,
  deleteOtpsByUserId,
  createOtp
};
