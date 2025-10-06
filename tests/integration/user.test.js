const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const dbManager = require('../../src/db/dbManager');
const { setupTestDB } = require('../setup');

// Setup test database
setupTestDB();

describe('User routes', () => {
  const user = {
    email: 'testuser@example.com',
    password: 'password123',
    name: 'Test User',
    phone: '+1234567890',
    role: 'user'
  };

  const adminUser = {
    email: 'admin@example.com',
    password: 'password123',
    name: 'Admin User',
    phone: '+1234567891',
    role: 'admin'
  };

  let adminToken;
  let userToken;
  let createdUserId;

  beforeAll(async () => {
    // Create admin user and get token
    await request(app)
      .post('/v1/auth/register')
      .send(adminUser)
      .expect(httpStatus.CREATED);

    const adminRes = await request(app)
      .post('/v1/auth/login')
      .send({
        email: adminUser.email,
        password: adminUser.password
      })
      .expect(httpStatus.OK);

    adminToken = adminRes.body.tokens.access.token;

    // Create regular user and get token
    await request(app)
      .post('/v1/auth/register')
      .send(user)
      .expect(httpStatus.CREATED);

    const userRes = await request(app)
      .post('/v1/auth/login')
      .send({
        email: user.email,
        password: user.password
      })
      .expect(httpStatus.OK);

    userToken = userRes.body.tokens.access.token;
    createdUserId = userRes.body.user.id;
  });

  describe('GET /v1/users', () => {
    it('should return all users for admin', async () => {
      const res = await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.arrayContaining([
          expect.objectContaining({
            id: expect.anything(),
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role
          }),
          expect.objectContaining({
            id: expect.anything(),
            email: adminUser.email,
            name: adminUser.name,
            phone: adminUser.phone,
            role: adminUser.role
          })
        ]),
        page: expect.any(Number),
        limit: expect.any(Number),
        totalPages: expect.any(Number),
        totalResults: expect.any(Number)
      });
    });

    it('should return 401 if user is not authenticated', async () => {
      await request(app)
        .get('/v1/users')
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 if user is not admin', async () => {
      await request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(httpStatus.FORBIDDEN);
    });
  });

  describe('GET /v1/users/:userId', () => {
    it('should return user for admin', async () => {
      const res = await request(app)
        .get(`/v1/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: createdUserId,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role
        })
      );
    });

    it('should return 401 if user is not authenticated', async () => {
      await request(app)
        .get(`/v1/users/${createdUserId}`)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 if user is not admin', async () => {
      await request(app)
        .get(`/v1/users/${createdUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 404 if user is not found', async () => {
      await request(app)
        .get('/v1/users/invalid-user-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PUT /v1/users/:userId', () => {
    it('should update user for admin', async () => {
      const updateData = {
        name: 'Updated User Name',
        email: 'updated@example.com'
      };

      const res = await request(app)
        .put(`/v1/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(httpStatus.OK);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: createdUserId,
          name: updateData.name,
          email: updateData.email
        })
      );
    });

    it('should return 401 if user is not authenticated', async () => {
      await request(app)
        .put(`/v1/users/${createdUserId}`)
        .send({ name: 'Updated Name' })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 if user is not admin', async () => {
      await request(app)
        .put(`/v1/users/${createdUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name' })
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 404 if user is not found', async () => {
      await request(app)
        .put('/v1/users/invalid-user-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Name' })
        .expect(httpStatus.NOT_FOUND);
    });

    it('should return 400 if email is invalid', async () => {
      await request(app)
        .put(`/v1/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'invalid-email' })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('DELETE /v1/users/:userId', () => {
    it('should delete user for admin', async () => {
      await request(app)
        .delete(`/v1/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.NO_CONTENT);
    });

    it('should return 401 if user is not authenticated', async () => {
      await request(app)
        .delete(`/v1/users/${createdUserId}`)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 if user is not admin', async () => {
      await request(app)
        .delete(`/v1/users/${createdUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 404 if user is not found', async () => {
      await request(app)
        .delete('/v1/users/invalid-user-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.NOT_FOUND);
    });
  });
});