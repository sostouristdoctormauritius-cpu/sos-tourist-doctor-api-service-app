const { createUser, isEmailTaken, isPhoneTaken } = require('../../src/services/user.service');
const dbManager = require('../../src/db/dbManager');
const streamService = require('../../src/services/stream.service');
const realtimeService = require('../../src/services/realtime.service');
const httpStatus = require('http-status');
const ApiError = require('../../src/utils/ApiError');
const logger = require('../../src/config/logger');

// Mock the dependencies
jest.mock('../../src/db/dbManager');
jest.mock('../../src/services/stream.service');
jest.mock('../../src/services/realtime.service');
jest.mock('../../src/config/logger');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      phone: '+1234567890'
    };

    it('should throw an error if email is already taken', async () => {
      dbManager.findOne.mockResolvedValue({ id: '1', email: userData.email });
      
      await expect(createUser(userData))
        .rejects
        .toThrow(new ApiError(httpStatus.BAD_REQUEST, `Your profile is incomplete, Try to login with ${userData.email}`));
      
      expect(dbManager.findOne).toHaveBeenCalledWith('users', { email: userData.email });
    });

    it('should throw an error if phone is already taken', async () => {
      dbManager.findOne
        .mockResolvedValueOnce(null) // First call for email check
        .mockResolvedValueOnce({ id: '1', phone: userData.phone }); // Second call for phone check
      
      await expect(createUser(userData))
        .rejects
        .toThrow(new ApiError(httpStatus.BAD_REQUEST, 'Phone already taken'));
      
      expect(dbManager.findOne).toHaveBeenNthCalledWith(1, 'users', { email: userData.email });
      expect(dbManager.findOne).toHaveBeenNthCalledWith(2, 'users', { phone: userData.phone });
    });

    it('should create a user successfully', async () => {
      const createdUser = { id: '1', ...userData };
      dbManager.findOne.mockResolvedValue(null); // No existing user with email or phone
      dbManager.create.mockResolvedValue(createdUser);
      streamService.createUser.mockResolvedValue();
      realtimeService.emitEvent.mockResolvedValue();
      
      const result = await createUser(userData);
      
      expect(result).toEqual(createdUser);
      expect(dbManager.create).toHaveBeenCalledWith('users', userData);
      expect(streamService.createUser).toHaveBeenCalledWith(createdUser);
      expect(realtimeService.emitEvent).toHaveBeenCalledWith('userCreated', {
        userId: createdUser.id,
        user: createdUser,
        timestamp: expect.any(Date)
      });
    });
  });

  describe('isEmailTaken', () => {
    it('should return true if email is taken', async () => {
      dbManager.findOne.mockResolvedValue({ id: '1', email: 'test@example.com' });
      
      const result = await isEmailTaken('test@example.com');
      
      expect(result).toBe(true);
      expect(dbManager.findOne).toHaveBeenCalledWith('users', { email: 'test@example.com' });
    });

    it('should return false if email is not taken', async () => {
      dbManager.findOne.mockResolvedValue(null);
      
      const result = await isEmailTaken('test@example.com');
      
      expect(result).toBe(false);
      expect(dbManager.findOne).toHaveBeenCalledWith('users', { email: 'test@example.com' });
    });
  });

  describe('isPhoneTaken', () => {
    it('should return true if phone is taken', async () => {
      dbManager.findOne.mockResolvedValue({ id: '1', phone: '+1234567890' });
      
      const result = await isPhoneTaken('+1234567890');
      
      expect(result).toBe(true);
      expect(dbManager.findOne).toHaveBeenCalledWith('users', { phone: '+1234567890' });
    });

    it('should return false if phone is not taken', async () => {
      dbManager.findOne.mockResolvedValue(null);
      
      const result = await isPhoneTaken('+1234567890');
      
      expect(result).toBe(false);
      expect(dbManager.findOne).toHaveBeenCalledWith('users', { phone: '+1234567890' });
    });
  });
});