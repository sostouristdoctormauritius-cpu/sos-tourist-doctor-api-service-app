const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const dbManager = require('../../src/db/dbManager');
const { setupTestDB } = require('../setup');

// Setup test database
setupTestDB();

describe('Auth routes', () => {
  const user = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  };

  describe('POST /v1/auth/register', () => {
    it('should register a new user and return tokens', async () => {
      const res = await request(app)
        .post('/v1/auth/register')
        .send(user)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        user: expect.objectContaining({
          id: expect.anything(),
          email: user.email,
          name: user.name
        }),
        tokens: {
          access: expect.objectContaining({
            token: expect.anything(),
            expires: expect.anything()
          }),
          refresh: expect.objectContaining({
            token: expect.anything(),
            expires: expect.anything()
          })
        }
      });
    });

    it('should return 400 if email is invalid', async () => {
      await request(app)
        .post('/v1/auth/register')
        .send({
          ...user,
          email: 'invalid-email'
        })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('POST /v1/auth/login', () => {
    beforeEach(async () => {
      // Create user before login test
      await request(app)
        .post('/v1/auth/register')
        .send(user)
        .expect(httpStatus.CREATED);
    });

    it('should login successfully and return tokens', async () => {
      const res = await request(app)
        .post('/v1/auth/login')
        .send({
          email: user.email,
          password: user.password
        })
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        user: expect.objectContaining({
          id: expect.anything(),
          email: user.email,
          name: user.name
        }),
        tokens: {
          access: expect.objectContaining({
            token: expect.anything(),
            expires: expect.anything()
          }),
          refresh: expect.objectContaining({
            token: expect.anything(),
            expires: expect.anything()
          })
        }
      });
    });

    it('should return 401 if email is wrong', async () => {
      await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'wrong@example.com',
          password: user.password
        })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 401 if password is wrong', async () => {
      await request(app)
        .post('/v1/auth/login')
        .send({
          email: user.email,
          password: 'wrongpassword'
        })
        .expect(httpStatus.UNAUTHORIZED);
    });
  });
});
