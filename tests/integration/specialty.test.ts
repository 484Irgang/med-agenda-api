import request from 'supertest';
import { createApp } from '../../src/index';
import { Express } from 'express';

describe('Specialty Routes', () => {
  let app: Express;
  let specialtyId: number;

  beforeAll(async () => {
    process.env.DATABASE_PATH = `:memory:specialty-${Date.now()}`;
    app = await createApp();
  });

  describe('POST /specialty', () => {
    it('should create a new specialty', async () => {
      const response = await request(app)
        .post('/specialty')
        .send({ name: 'Cardiology' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Cardiology');

      specialtyId = response.body.data.id;
    });

    it('should reject duplicate specialty name', async () => {
      const response = await request(app)
        .post('/specialty')
        .send({ name: 'Cardiology' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /specialty', () => {
    it('should get all specialties', async () => {
      const response = await request(app).get('/specialty');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /specialty/:id', () => {
    it('should get specialty by id', async () => {
      const response = await request(app).get(`/specialty/${specialtyId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(specialtyId);
    });

    it('should return 404 for non-existent specialty', async () => {
      const response = await request(app).get('/specialty/99999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /specialty/:id', () => {
    it('should update specialty', async () => {
      const response = await request(app)
        .put(`/specialty/${specialtyId}`)
        .send({ name: 'Cardiology Updated' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Cardiology Updated');
    });
  });

  describe('DELETE /specialty/:id', () => {
    it('should delete specialty', async () => {
      const response = await request(app).delete(`/specialty/${specialtyId}`);

      expect(response.status).toBe(204);
    });
  });
});
