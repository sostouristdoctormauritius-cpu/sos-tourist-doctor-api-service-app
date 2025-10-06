const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const dbManager = require('../../src/db/dbManager');
const { setupTestDB } = require('../setup');

// Setup test database
setupTestDB();

describe('Availability routes', () => {
  const doctor = {
    email: 'doctor2@example.com',
    password: 'password123',
    name: 'Doctor Two',
    phone: '+1234567893',
    role: 'doctor'
  };

  const adminUser = {
    email: 'admin2@example.com',
    password: 'password123',
    name: 'Admin Two',
    phone: '+1234567894',
    role: 'admin'
  };

  let doctorToken;
  let adminToken;
  let createdDoctorId;
  let createdAvailabilityId;

  beforeAll(async () => {
    // Create doctor and get token
    await request(app)
      .post('/v1/auth/register')
      .send(doctor)
      .expect(httpStatus.CREATED);

    const doctorRes = await request(app)
      .post('/v1/auth/login')
      .send({
        email: doctor.email,
        password: doctor.password
      })
      .expect(httpStatus.OK);

    doctorToken = doctorRes.body.tokens.access.token;
    createdDoctorId = doctorRes.body.user.id;

    // Create admin
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
  });

  describe('POST /v1/availability', () => {
    it('should create availability for doctor', async () => {
      const availabilityData = {
        startDate: '2024-12-25',
        endDate: '2024-12-25',
        startTime: '09:00',
        endTime: '17:00',
        isRecurring: false
      };

      const res = await request(app)
        .post('/v1/availability')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(availabilityData)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        doctorId: createdDoctorId,
        startDate: availabilityData.startDate,
        endDate: availabilityData.endDate,
        startTime: availabilityData.startTime,
        endTime: availabilityData.endTime,
        isRecurring: availabilityData.isRecurring,
        createdAt: expect.anything(),
        updatedAt: expect.anything()
      });

      createdAvailabilityId = res.body.id;
    });

    it('should return 401 if user is not authenticated', async () => {
      await request(app)
        .post('/v1/availability')
        .send({
          startDate: '2024-12-25',
          endDate: '2024-12-25',
          startTime: '09:00',
          endTime: '17:00'
        })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 400 if required fields are missing', async () => {
      await request(app)
        .post('/v1/availability')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          startDate: '2024-12-25'
        })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/availability/doctor/:doctorId', () => {
    it('should return doctor availability', async () => {
      const res = await request(app)
        .get(`/v1/availability/doctor/${createdDoctorId}`)
        .expect(httpStatus.OK);

      expect(res.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: createdAvailabilityId,
            doctorId: createdDoctorId,
            startDate: '2024-12-25',
            endDate: '2024-12-25',
            startTime: '09:00',
            endTime: '17:00',
            isRecurring: false
          })
        ])
      );
    });

    it('should return 404 if doctor is not found', async () => {
      await request(app)
        .get('/v1/availability/doctor/invalid-doctor-id')
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PUT /v1/availability/:availabilityId', () => {
    it('should update availability for doctor', async () => {
      const updateData = {
        startTime: '10:00',
        endTime: '16:00'
      };

      const res = await request(app)
        .put(`/v1/availability/${createdAvailabilityId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(updateData)
        .expect(httpStatus.OK);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: createdAvailabilityId,
          startTime: updateData.startTime,
          endTime: updateData.endTime
        })
      );
    });

    it('should return 401 if user is not authenticated', async () => {
      await request(app)
        .put(`/v1/availability/${createdAvailabilityId}`)
        .send({ startTime: '10:00' })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 if user is not the owner of the availability', async () => {
      // Create another doctor to test access control
      const anotherDoctor = {
        email: 'anotherdoctor@example.com',
        password: 'password123',
        name: 'Another Doctor',
        phone: '+1234567895',
        role: 'doctor'
      };

      await request(app)
        .post('/v1/auth/register')
        .send(anotherDoctor)
        .expect(httpStatus.CREATED);

      const anotherDoctorRes = await request(app)
        .post('/v1/auth/login')
        .send({
          email: anotherDoctor.email,
          password: anotherDoctor.password
        })
        .expect(httpStatus.OK);

      const anotherDoctorToken = anotherDoctorRes.body.tokens.access.token;

      await request(app)
        .put(`/v1/availability/${createdAvailabilityId}`)
        .set('Authorization', `Bearer ${anotherDoctorToken}`)
        .send({ startTime: '11:00' })
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 404 if availability is not found', async () => {
      await request(app)
        .put('/v1/availability/invalid-availability-id')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ startTime: '11:00' })
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/availability/:availabilityId', () => {
    it('should delete availability for doctor', async () => {
      await request(app)
        .delete(`/v1/availability/${createdAvailabilityId}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(httpStatus.NO_CONTENT);
    });

    it('should return 401 if user is not authenticated', async () => {
      await request(app)
        .delete(`/v1/availability/${createdAvailabilityId}`)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 403 if user is not the owner of the availability', async () => {
      // Create an availability to test with
      const availabilityData = {
        startDate: '2024-12-26',
        endDate: '2024-12-26',
        startTime: '09:00',
        endTime: '17:00',
        isRecurring: false
      };

      const res = await request(app)
        .post('/v1/availability')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(availabilityData)
        .expect(httpStatus.CREATED);

      const availabilityId = res.body.id;

      // Create another doctor to test access control
      const anotherDoctor = {
        email: 'anotherdoctor2@example.com',
        password: 'password123',
        name: 'Another Doctor 2',
        phone: '+1234567896',
        role: 'doctor'
      };

      await request(app)
        .post('/v1/auth/register')
        .send(anotherDoctor)
        .expect(httpStatus.CREATED);

      const anotherDoctorRes = await request(app)
        .post('/v1/auth/login')
        .send({
          email: anotherDoctor.email,
          password: anotherDoctor.password
        })
        .expect(httpStatus.OK);

      const anotherDoctorToken = anotherDoctorRes.body.tokens.access.token;

      await request(app)
        .delete(`/v1/availability/${availabilityId}`)
        .set('Authorization', `Bearer ${anotherDoctorToken}`)
        .expect(httpStatus.FORBIDDEN);
    });

    it('should return 404 if availability is not found', async () => {
      await request(app)
        .delete('/v1/availability/invalid-availability-id')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(httpStatus.NOT_FOUND);
    });
  });
});