const httpStatus = require('http-status');
const { register, login } = require('../../src/controllers/auth.controller');
const { authService, userService, tokenService } = require('../../src/services');
const ApiError = require('../../src/utils/ApiError');
const catchAsync = require('../../src/utils/catchAsync');

// Mock the services
jest.mock('../../src/services', () => ({
  authService: {
    loginUserWithEmailAndPassword: jest.fn(),
    registerUser: jest.fn(),
    logout: jest.fn(),
    refreshAuth: jest.fn()
  },
  userService: {
    createUser: jest.fn()
  },
  tokenService: {
    generateAuthTokens: jest.fn()
  }
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn()
    }
  }))
}));

// Mock catchAsync
jest.mock('../../src/utils/catchAsync', () => {
  return jest.fn((fn) => fn);
});

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a user, generate tokens and send success response', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User'
      };
      const tokens = {
        access: {
          token: 'access-token',
          expires: new Date()
        },
        refresh: {
          token: 'refresh-token',
          expires: new Date()
        }
      };

      req.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      userService.createUser.mockResolvedValue(user);
      tokenService.generateAuthTokens.mockResolvedValue(tokens);

      await register(req, res);

      expect(userService.createUser).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      }));
      expect(tokenService.generateAuthTokens).toHaveBeenCalledWith(user);
      expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        user,
        tokens
      });
    });
  });

  describe('login', () => {
    it('should login user, generate tokens and send success response', async () => {
      const user = {
        id: '1',
        email: 'test@example.com'
      };
      const tokens = {
        access: {
          token: 'access-token',
          expires: new Date()
        },
        refresh: {
          token: 'refresh-token',
          expires: new Date()
        }
      };

      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      authService.loginUserWithEmailAndPassword.mockResolvedValue(user);
      tokenService.generateAuthTokens.mockResolvedValue(tokens);

      await login(req, res);

      expect(authService.loginUserWithEmailAndPassword).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
      expect(tokenService.generateAuthTokens).toHaveBeenCalledWith(user);
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        user,
        tokens
      });
    });
  });
});
