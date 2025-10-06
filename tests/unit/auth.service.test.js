const { loginUserWithEmailAndPassword } = require('../../src/services/auth.service');
const userService = require('../../src/services/user.service');
const tokenService = require('../../src/services/token.service');
const bcrypt = require('bcryptjs');
const httpStatus = require('http-status');
const ApiError = require('../../src/utils/ApiError');

// Mock the dependencies
jest.mock('../../src/services/user.service');
jest.mock('../../src/services/token.service');
jest.mock('bcryptjs');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loginUserWithEmailAndPassword', () => {
    const email = 'test@example.com';
    const password = 'password123';
    const user = {
      id: '1',
      email,
      password: 'hashedPassword'
    };

    it('should throw an error if user is not found', async () => {
      userService.getActiveUserByEmailOrPhone.mockResolvedValue(null);

      await expect(loginUserWithEmailAndPassword(email, password))
        .rejects
        .toThrow(new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password'));

      expect(userService.getActiveUserByEmailOrPhone).toHaveBeenCalledWith(email);
    });

    it('should throw an error if password is incorrect', async () => {
      userService.getActiveUserByEmailOrPhone.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);

      await expect(loginUserWithEmailAndPassword(email, password))
        .rejects
        .toThrow(new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password'));

      expect(userService.getActiveUserByEmailOrPhone).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
    });

    it('should return user object without password if credentials are correct', async () => {
      userService.getActiveUserByEmailOrPhone.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);

      const result = await loginUserWithEmailAndPassword(email, password);

      expect(result).toEqual({ id: user.id, email: user.email });
      expect(userService.getActiveUserByEmailOrPhone).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
    });
  });
});
