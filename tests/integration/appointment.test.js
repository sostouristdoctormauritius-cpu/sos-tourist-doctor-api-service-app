const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const dbManager = require('../../src/db/dbManager');
const { setupTestDB } = require('../setup');

// Setup test database
setupTestDB();

describe('Appointment routes', () => {
  const user = {
    email: 'patient@example.com',
    password: 'password123',
    name: 'Patient User',
    phone: '+1234567890',
    role: 'user'
  };

  const doctor = {
    email: 'doctor@example.com',
    password: 'password123',
    name: 'Doctor User',
    phone: '+1234567891',
    role: 'doctor'
  };

  const adminUser = {
    email: 'admin@example.com',
    password: 'password123',
    name: 'Admin User',
    phone: '+1234567892',
    role: 'admin'
  };

  let userToken;
  let doctorToken;
  let adminToken;
  let createdAppointmentId;
  let createdDoctorId;

  beforeAll(async () => {
    // Create users and get tokens
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

    // Create doctor
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

  describe('POST /v1/appointments', () => {
    it('should create a new appointment for authenticated user', async () => {
      const appointmentData = {
        doctorId: createdDoctorId,
        date: '2024-12-25',
        startTime: '10:00',
        endTime: '11:00',
        consultationType: 'video',
        symptoms: ['fever', 'cough'],
        additionalNote: 'Patient has a fever and cough'
      };

      const res = await request(app)
        .post('/v1/appointments')
        .set('Authorization', `Bearer ${userToken}`)
        .send(appointmentData)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({
        id: expect.anything(),
        userId: expect.anything(),
        doctorId: createdDoctorId,
        date: appointmentData.date,
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        consultationType: appointmentData.consultationType,
        symptoms: appointmentData.symptoms,
        additionalNote: appointmentData.additionalNote,
        status: 'pending_payment',
        createdAt: expect.anything(),
        updatedAt: expect.anything()
      });

      createdAppointmentId = res.body.id;
    });

    it('should return 401 if user is not authenticated', async () => {
      await request(app)
        .post('/v1/appointments')
        .send({
          doctorId: createdDoctorId,
          date: '2024-12-25',
          startTime: '10:00',
          endTime: '11:00',
          consultationType: 'video'
        })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 400 if required fields are missing', async () => {
      await request(app)
        .post('/v1/appointments')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          doctorId: createdDoctorId,
          date: '2024-12-25'
        })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /v1/appointments', () => {
    it('should return user appointments', async () => {
      const res = await request(app)
        .get('/v1/appointments')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.arrayContaining([
          expect.objectContaining({
            id: createdAppointmentId,
            userId: expect.anything(),
            doctorId: createdDoctorId,
            date: '2024-12-25',
            startTime: '10:00',
            endTime: '11:00',
            consultationType: 'video',
            symptoms: ['fever', 'cough'],
            status: 'pending_payment'
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
        .get('/v1/appointments')
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/appointments/:appointmentId', () => {
    it('should return appointment details', async () => {
      const res = await request(app)
        .get(`/v1/appointments/${createdAppointmentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: createdAppointmentId,
          userId: expect.anything(),
          doctorId: createdDoctorId,
          date: '2024-12-25',
          startTime: '10:00',
          endTime: '11:00',
          consultationType: 'video',
          symptoms: ['fever', 'cough'],
          status: 'pending_payment'
        })
      );
    });

    it('should return 401 if user is not authenticated', async () => {
      await request(app)
        .get(`/v1/appointments/${createdAppointmentId}`)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 404 if appointment is not found', async () => {
      await request(app)
        .get('/v1/appointments/invalid-appointment-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PUT /v1/appointments/:appointmentId', () => {
    it('should update appointment for user', async () => {
      const updateData = {
        additionalNote: 'Updated note'
      };

      const res = await request(app)
        .put(`/v1/appointments/${createdAppointmentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(httpStatus.OK);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: createdAppointmentId,
          additionalNote: updateData.additionalNote
        })
      );
    });

    it('should return 401 if user is not authenticated', async () => {
      await request(app)
        .put(`/v1/appointments/${createdAppointmentId}`)
        .send({ additionalNote: 'Updated note' })
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 404 if appointment is not found', async () => {
      await request(app)
        .put('/v1/appointments/invalid-appointment-id')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ additionalNote: 'Updated note' })
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/appointments/:appointmentId', () => {
    it('should delete appointment for user', async () => {
      await request(app)
        .delete(`/v1/appointments/${createdAppointmentId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(httpStatus.NO_CONTENT);
    });

    it('should return 401 if user is not authenticated', async () => {
      await request(app)
        .delete(`/v1/appointments/${createdAppointmentId}`)
        .expect(httpStatus.UNAUTHORIZED);
    });

    it('should return 404 if appointment is not found', async () => {
      await request(app)
        .delete('/v1/appointments/invalid-appointment-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(httpStatus.NOT_FOUND);
    });
  });
});