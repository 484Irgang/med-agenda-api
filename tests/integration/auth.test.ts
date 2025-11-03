import request from 'supertest';
import { createApp } from '../../src/index';
import { Express } from 'express';
import { UserType } from '../../src/types/entities';

describe('Auth Routes', () => {
  let app: Express;

  beforeAll(async () => {
    process.env.DATABASE_PATH = `:memory:auth-${Date.now()}`;
    app = await createApp();
  });

  describe('POST /auth/register', () => {
    it('should register a new patient user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'patient@example.com',
          password: 'password123',
          type: UserType.PATIENT,
          name: 'Test Patient',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('patient@example.com');
    });

    it('should register a new doctor user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'doctor@example.com',
          password: 'password123',
          type: UserType.DOCTOR,
          name: 'Test Doctor',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.type).toBe(UserType.DOCTOR);
    });

    it('should reject duplicate email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'patient@example.com',
          password: 'password123',
          type: UserType.PATIENT,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already registered');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          type: UserType.PATIENT,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'patient@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('patient@example.com');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'patient@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /auth/me', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'patient@example.com',
          password: 'password123',
        });

      token = response.body.data.token;
    });

    it('should return current user with valid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('patient@example.com');
      expect(response.body.data.password).toBeUndefined();
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app).post('/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
