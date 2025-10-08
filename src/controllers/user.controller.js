const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const {
  supabaseStorageService,
  userService,
  tokenService,
  streamService,
  emailService,
  authService
} = require('../services');
const otpService = require('../services/otp.service');
const path = require('path');
const logger = require('../config/logger');

const twilio = require('../services/twilio.service');

const getMe = catchAsync(async (req, res) => {
  res.send(req.user);
});

const sendInvitation = catchAsync(async (req, res) => {
  const { name, email, role } = req.body;
  await userService.sendInvitation(name, email, role);
  res.status(httpStatus.OK).send({ message: 'Invitation sent successfully' });
});

const registerInvitedUser = catchAsync(async (req, res) => {
  const { token, password } = req.body;
  await userService.registerInvitedUser(token, password);
  res.status(httpStatus.OK).send({ message: 'Registration successful' });
});

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getDoctors = catchAsync(async (req, res) => {
  const filter = pick(req.query, []);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryDoctors(filter, options);
  res.send(result);
});

const getPatients = catchAsync(async (req, res) => {
  const filter = pick(req.query, []);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryPatients(filter, options);
  res.send(result);
});

const getClients = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  // Ensure we only get non-doctor users (clients)
  if (!filter.role) {
    filter.role = { neq: 'doctor' };
  }

  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getDoctorsWithFilters = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['specialization', 'language', 'search']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryDoctors(filter, options);
  res.send(result);
});

const getDoctorById = catchAsync(async (req, res) => {
  const doctor = await userService.getUserById(req.params.doctorId);

  if (!doctor || doctor.role !== 'doctor') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
  }

  // Check if doctor profile is listed
  if (!doctor.doctor_profile || !doctor.doctor_profile.is_listed) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Doctor not found');
  }

  // Transform the data to provide a cleaner response
  const {
    id,
    name,
    email,
    phone,
    profile_picture,
    doctor_profile,
    created_at,
    updated_at
  } = doctor;

  const profile = doctor_profile || {};

  const transformedDoctor = {
    id,
    name,
    email: email || null, // Show email correctly
    phone: profile.phone_visible ? phone : null, // Only show phone if it's visible
    profile_picture: profile_picture || null,
    specialisation: profile.specialisation || null,
    rating: profile.rating || null,
    rating_count: profile.rating_count || 0,
    address: profile.address || null,
    working_hours: profile.working_hours || null,
    bio: profile.bio || null,
    supported_languages: profile.supported_languages || [],
    education: profile.education || null,
    experience: profile.experience || null,
    certifications: profile.certifications || [],
    created_at,
    updated_at
  };

  res.send(transformedDoctor);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  const user = await userService.archiveUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.NO_CONTENT).send();
});

const requestDeletion = catchAsync(async (req, res) => {
  const { email } = req.body;
  try {
    await userService.requestDeletion(email);
    res.status(200).json({ message: 'Deletion request sent' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const completeUserDeletion = catchAsync(async (req, res) => {
  const { token } = req.body;
  try {
    await userService.completeDeletion(token);
    res.status(200).json({ message: 'Deletion successful' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const getCurrentUser = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const user = await userService.getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateCurrentUser = catchAsync(async (req, res) => {
  const data = req.body;
  const userId = req.user._id;
  if (req.file) {
    data.profilePicture = req.file.path || null;
  }

  if (typeof data.userProfile === 'string') {
    data.userProfile = JSON.parse(data.userProfile);
  }
  logger.info('update user data', data);
  const user = await userService.updateUserById(userId, data);
  res.send(user);
});

const deleteCurrentUser = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const user = await userService.archiveUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const uploadProfilePicture = catchAsync(async (req, res) => {
  if (!req.file) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .send({ error: 'No file uploaded' });
  }

  const userId = req.user._id;
  const user = await userService.getUserById(userId);

  const fileExtension = path.extname(req.file.originalname);
  const fileName = `profile_pictures/pp-${Date.now().toString()}-${userId}${fileExtension}`;

  try {
    const fileUrl = await supabaseStorageService.uploadFile(
      req.file.buffer,
      fileName,
      req.file.mimetype
    );

    // Delete previous profile picture before saving new one to database
    const oldProfilePictureUrl = user.userProfile?.profilePicture;
    if (oldProfilePictureUrl) {
      try {
        const fileNameToDelete = oldProfilePictureUrl.split('/').pop();
        await supabaseStorageService.deleteFile(
          `profile_pictures/${fileNameToDelete}`
        );
      } catch (deleteError) {
        logger.warn('Failed to delete old profile picture:', deleteError);
        // Continue with the operation even if deletion fails
      }
    }

    const updatedUser = await userService.updateUserProfilePicture(
      userId,
      fileUrl
    );

    res.status(httpStatus.OK).send({
      message: 'Profile picture uploaded successfully',
      profilePicture: updatedUser.userProfile.profilePicture
    });
  } catch (uploadError) {
    logger.error('Failed to upload profile picture:', uploadError);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to upload profile picture');
  }
});



const verifyOtp = catchAsync(async (req, res) => {
  const { otp } = req.body;
  const userId = req.user?.id || req.user._id;
  const userType = req.user?.type; // Capture user type for conditional logic

  if (!userId || !otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User ID and OTP are required');
  }

  // Use the OTP service to verify the OTP
  const isOtpValid = await otpService.verifyOtp(userId, otp);

  if (!isOtpValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  }

  // Conditional logic based on userType or other flags
  // Assuming 'tempUserVerification' is a type that would have been set for verifyOtpApp's use case
  if (userType === 'tempUserVerification') {
    await userService.updateTempUserById(userId, { isVerified: 'true' });
    res.status(httpStatus.CREATED).send({
      message: 'OTP verified successfully'
    });
  } else { // Default behavior for general OTP verification (including "forget" type)
    const user = await userService.updateUserById(
      userId,
      { isStatus: 'active' }
    );

    if (userType === 'forget') {
      res.status(httpStatus.CREATED).send({
        message: 'OTP verified successfully',
        user
      });
    } else {
      const tokens = await tokenService.generateAuthTokens(user);
      const streamToken = streamService.getUserToken(user._id);

      res.status(httpStatus.CREATED).send({
        message: 'OTP verified successfully',
        user,
        tokens,
        streamToken
      });
    }
  }
});

// const resendOtp = async (req, res) => {
//   const user = req.user;
//   console.log("usersuser", user);
//   const otpCode = await sendOtp(user);
//   console.log("otpCode", otpCode);
//   const otp = otpCode.otp;

//   const token = await tokenService.generateTempTokens(user);
//   console.log("resend otp msg", otp);
//   res.status(httpStatus.CREATED).send({ user, token, otp,msg:`OTP sent either on email or mobile number ${user.phone}`  });

//   // try {
//   //   const otpDoc = await Otp.findOne({ userId, otp });

//   //   if (!otpDoc) {
//   //     return res.status(400).json({ message: 'Invalid OTP' });
//   //   }

//   //   // Check if OTP is expired
//   //   if (new Date() > otpDoc.expiresAt) {
//   //     // Clean up expired OTP
//   //     await Otp.deleteMany({ userId });
//   //     return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
//   //   }

//   //   // OTP is valid
//   //   await otpModel.deleteMany({ userId }); // Clean up OTP after successful use

//   //   // Optional: Update user verification status
//   //   const user =  await User.findByIdAndUpdate(userId, { isStatus: "active" });

//   //   console.log("user",user);

//   //   return res.status(200).json({ message: 'OTP verified successfully' });

//   // } catch (error) {
//   //   return res.status(500).json({ message: 'Internal server error', error: error.message });
//   // }
// };

const resendOtp = async (req, res) => {
  const user = req.user;
  if (req?.body?.username) {
    const { username } = req.body;
    const isEmail = isValidEmail(username);
    if (isEmail) {
      checkusername = 'email';
      await authService.sendloginOtp(user, checkusername);

      const token = await tokenService.generateTempTokens(user);
      res.status(httpStatus.CREATED).send({
        user,
        token,
        msg: `OTP sent on email ${username}`
      });
    } else {
      checkusername = 'phone';
      await authService.sendloginOtp(user, checkusername);

      const token = await tokenService.generateTempTokens(user);
      res.status(httpStatus.CREATED).send({
        user,
        token,
        msg: `OTP sent on number ${username}`
      });
    }
  } else {
    logger.info('Resending OTP for current user');
    const otpCode = await authService.sendOtpForUser(user);

    const otp = otpCode.otp;
    const token = await tokenService.generateTempTokens(user);
    res.status(httpStatus.CREATED).send({
      user,
      token,
      otp,
      msg: `OTP sent either on email or mobile number ${user.phone}`
    });
  }
};

const verifyEmailApp = catchAsync(async (req, res) => {
  const { email, verificationToken } = req.body;

  if (!email || !verificationToken) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email and verification token are required');
  }

  // Find user by email and verify token
  const user = await userService.verifyUserEmail(email, verificationToken);

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid verification token or user not found');
  }

  // Generate auth tokens
  const tokens = await tokenService.generateAuthTokens(user);

  res.status(httpStatus.OK).send({
    message: 'Email verified successfully',
    user,
    tokens
  });
});

const verifyOtpApp = catchAsync(async (req, res) => {
  const { otp, email } = req.body;

  if (!otp || !email) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP and email are required');
  }

  // Find user by email
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Verify OTP using the OTP service
  const isOtpValid = await otpService.verifyOtp(user._id, otp);

  if (!isOtpValid) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  }

  // Update user status to active
  const updatedUser = await userService.updateUserById(user._id, {
    isStatus: 'active'
  });

  // Generate auth tokens
  const tokens = await tokenService.generateAuthTokens(updatedUser);

  res.status(httpStatus.OK).send({
    message: 'OTP verified successfully',
    user: updatedUser,
    tokens
  });
});

module.exports = {
  sendInvitation,
  registerInvitedUser,
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  requestDeletion,
  completeUserDeletion,
  deleteCurrentUser,
  getCurrentUser,
  updateCurrentUser,
  uploadProfilePicture,
  getDoctors,
  getPatients,
  getClients,
  getDoctorsWithFilters,
  getDoctorById,
  verifyOtp,
  resendOtp,
  verifyEmailApp,
  verifyOtpApp,
  getMe
};
