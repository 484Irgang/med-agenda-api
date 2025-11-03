import request from 'supertest';
import { createApp } from '../../src/index';
import { Express } from 'express';
import { UserType } from '../../src/types/entities';

describe('Appointment Routes', () => {
  let app: Express;
  let token: string;
  let patientId: number;
  let doctorId: number;
  let specialtyId: number;
  let appointmentId: number;

  beforeAll(async () => {
    process.env.DATABASE_PATH = `:memory:appointment-${Date.now()}`;
    app = await createApp();

    const registerResponse = await request(app)
      .post('/auth/register')
      .send({
        email: 'appointment-patient@example.com',
        password: 'password123',
        type: UserType.PATIENT,
        name: 'Appointment Test User',
      });

    token = registerResponse.body.data.token;

    const patientResponse = await request(app)
      .post('/patient/complete-registration')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Patient',
        email: 'patient@example.com',
        phone: '123456789',
        birthDate: '1990-01-01',
      });

    patientId = patientResponse.body.data.id;

    const specialtyResponse = await request(app)
      .post('/specialty')
      .send({ name: 'Dermatology' });

    specialtyId = specialtyResponse.body.data.id;

    const doctorRegisterResponse = await request(app)
      .post('/auth/register')
      .send({
        email: 'appointment-doctor@example.com',
        password: 'password123',
        type: UserType.DOCTOR,
        name: 'Appointment Test Doctor',
      });

    const doctorToken = doctorRegisterResponse.body.data.token;

    const doctorResponse = await request(app)
      .post('/doctor/complete-registration')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        name: 'Dr. Smith',
        crm: 'CRM12345',
        email: 'doctor@example.com',
        phone: '987654321',
        specialtyId: specialtyId,
      });

    doctorId = doctorResponse.body.data.id;
  });

  describe('POST /appointment', () => {
    it('should create a new appointment', async () => {
      const response = await request(app)
        .post('/appointment')
        .set('Authorization', `Bearer ${token}`)
        .send({
          patientId,
          doctorId,
          specialtyId,
          dateTime: new Date('2025-12-01T10:00:00Z').toISOString(),
          status: 'scheduled',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('scheduled');

      appointmentId = response.body.data.id;
    });

    it('should reject appointment without authentication', async () => {
      const response = await request(app)
        .post('/appointment')
        .send({
          patientId,
          doctorId,
          specialtyId,
          dateTime: new Date().toISOString(),
          status: 'scheduled',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /appointment', () => {
    it('should get all appointments', async () => {
      const response = await request(app).get('/appointment');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /appointment/:id', () => {
    it('should get appointment by id', async () => {
      const response = await request(app).get(`/appointment/${appointmentId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(appointmentId);
      expect(response.body.data.patient).toBeDefined();
      expect(response.body.data.doctor).toBeDefined();
      expect(response.body.data.specialty).toBeDefined();
    });
  });

  describe('GET /appointment/by-patient/:patientId', () => {
    it('should get appointments by patient id', async () => {
      const response = await request(app).get(`/appointment/by-patient/${patientId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /appointment/by-doctor/:doctorId', () => {
    it('should get appointments by doctor id', async () => {
      const response = await request(app).get(`/appointment/by-doctor/${doctorId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('PUT /appointment/:id', () => {
    it('should update appointment status', async () => {
      const response = await request(app)
        .put(`/appointment/${appointmentId}`)
        .send({ status: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
    });
  });

  describe('DELETE /appointment/:id', () => {
    it('should delete appointment', async () => {
      const response = await request(app).delete(`/appointment/${appointmentId}`);

      expect(response.status).toBe(204);
    });
  });
});
