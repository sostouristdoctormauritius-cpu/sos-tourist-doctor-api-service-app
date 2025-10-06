const httpStatus = require('http-status');
const doctorController = require('./doctor.controller');
const userService = require('../services/user.service');
const dbManager = require('../db/dbManager');
const ApiError = require('../utils/ApiError');

// Mock the dependencies
jest.mock('../services/user.service');
jest.mock('../db/dbManager');

describe('Doctor Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: '1', role: 'admin' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('getDoctors', () => {
    it('should get all doctors successfully', async () => {
      const mockDoctors = [
        { id: '1', name: 'Dr. Smith', role: 'doctor' },
        { id: '2', name: 'Dr. Johnson', role: 'doctor' }
      ];

      userService.queryDoctors.mockResolvedValue({
        results: mockDoctors,
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2
      });

      await doctorController.getDoctors(req, res, next);

      expect(userService.queryDoctors).toHaveBeenCalledWith({}, { page: 1, limit: 10, sortBy: undefined });
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        results: mockDoctors,
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      userService.queryDoctors.mockRejectedValue(error);

      await doctorController.getDoctors(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getDoctor', () => {
    it('should get a specific doctor successfully', async () => {
      const mockDoctor = { id: '1', name: 'Dr. Smith', role: 'doctor' };
      req.params.doctorId = '1';

      userService.getUserById.mockResolvedValue(mockDoctor);

      await doctorController.getDoctor(req, res, next);

      expect(userService.getUserById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockDoctor);
    });

    it('should handle doctor not found', async () => {
      req.params.doctorId = '999';
      userService.getUserById.mockResolvedValue(null);

      await doctorController.getDoctor(req, res, next);

      expect(next).toHaveBeenCalledWith(new ApiError(httpStatus.NOT_FOUND, 'Doctor not found'));
    });
  });

  describe('createDoctor', () => {
    it('should create a doctor successfully', async () => {
      const doctorData = {
        name: 'Dr. Smith',
        email: 'dr.smith@example.com',
        phone: '+1234567890',
        specialisation: 'Cardiology'
      };
      req.body = doctorData;

      const mockCreatedDoctor = { id: '1', ...doctorData };
      userService.createUser.mockResolvedValue(mockCreatedDoctor);

      await doctorController.createDoctor(req, res, next);

      expect(userService.createUser).toHaveBeenCalledWith(doctorData);
      expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith(mockCreatedDoctor);
    });

    it('should handle validation errors', async () => {
      const error = new ApiError(httpStatus.BAD_REQUEST, 'Validation error');
      userService.createUser.mockRejectedValue(error);

      await doctorController.createDoctor(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateDoctor', () => {
    it('should update a doctor successfully', async () => {
      const updateData = { name: 'Dr. Smith Updated' };
      req.params.doctorId = '1';
      req.body = updateData;

      const mockUpdatedDoctor = { id: '1', ...updateData };
      userService.updateUserById.mockResolvedValue(mockUpdatedDoctor);

      await doctorController.updateDoctor(req, res, next);

      expect(userService.updateUserById).toHaveBeenCalledWith('1', updateData);
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedDoctor);
    });
  });

  describe('deleteDoctor', () => {
    it('should delete a doctor successfully', async () => {
      req.params.doctorId = '1';
      const mockDeletedDoctor = { id: '1', name: 'Dr. Smith' };

      userService.deleteUserById.mockResolvedValue(mockDeletedDoctor);

      await doctorController.deleteDoctor(req, res, next);

      expect(userService.deleteUserById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockDeletedDoctor);
    });

    it('should handle doctor not found on delete', async () => {
      req.params.doctorId = '999';
      userService.deleteUserById.mockRejectedValue(new ApiError(httpStatus.NOT_FOUND, 'Doctor not found'));

      await doctorController.deleteDoctor(req, res, next);

      expect(next).toHaveBeenCalledWith(new ApiError(httpStatus.NOT_FOUND, 'Doctor not found'));
    });
  });

  describe('getDoctorProfile', () => {
    it('should get doctor profile successfully', async () => {
      const mockProfile = {
        id: '1',
        name: 'Dr. Smith',
        specialisation: 'Cardiology',
        experience: 10,
        rating: 4.5
      };
      req.params.doctorId = '1';

      userService.getUserById.mockResolvedValue(mockProfile);

      await doctorController.getDoctorProfile(req, res, next);

      expect(userService.getUserById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockProfile);
    });
  });

  describe('updateDoctorProfile', () => {
    it('should update doctor profile successfully', async () => {
      const profileData = {
        specialisation: 'Neurology',
        experience: 15,
        languages: ['English', 'French']
      };
      req.params.doctorId = '1';
      req.body = profileData;

      const mockUpdatedProfile = { id: '1', ...profileData };
      userService.updateUserById.mockResolvedValue(mockUpdatedProfile);

      await doctorController.updateDoctorProfile(req, res, next);

      expect(userService.updateUserById).toHaveBeenCalledWith('1', profileData);
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedProfile);
    });
  });

  describe('getDoctorAvailability', () => {
    it('should get doctor availability successfully', async () => {
      const mockAvailability = [
        { day: 'Monday', startTime: '09:00', endTime: '17:00' },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00' }
      ];
      req.params.doctorId = '1';

      // Mock the availability service if it exists, otherwise mock user service
      const availabilityService = require('../services/availability.service');
      jest.mock('../services/availability.service');
      availabilityService.getDoctorAvailability.mockResolvedValue(mockAvailability);

      await doctorController.getDoctorAvailability(req, res, next);

      expect(availabilityService.getDoctorAvailability).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockAvailability);
    });
  });

  describe('updateDoctorAvailability', () => {
    it('should update doctor availability successfully', async () => {
      const availabilityData = [
        { day: 'Monday', startTime: '10:00', endTime: '18:00' }
      ];
      req.params.doctorId = '1';
      req.body = availabilityData;

      const mockUpdatedAvailability = availabilityData;
      const availabilityService = require('../services/availability.service');
      jest.mock('../services/availability.service');
      availabilityService.updateDoctorAvailability.mockResolvedValue(mockUpdatedAvailability);

      await doctorController.updateDoctorAvailability(req, res, next);

      expect(availabilityService.updateDoctorAvailability).toHaveBeenCalledWith('1', availabilityData);
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedAvailability);
    });
  });
});
