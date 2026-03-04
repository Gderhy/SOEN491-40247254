import request from 'supertest';
import app from '../app';

describe('Health Endpoints', () => {
  describe('GET /health', () => {
    it('should return 200 with healthy status', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toBe('Service is healthy');
      expect(res.body.data.ok).toBe(true);
    });
  });

  describe('GET /health/detailed', () => {
    it('should return 200 with detailed health data', async () => {
      const res = await request(app).get('/health/detailed');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('ok');
      expect(res.body.data).toHaveProperty('environment');
      expect(res.body.data).toHaveProperty('supabase');
      expect(res.body.data).toHaveProperty('timestamp');
    });
  });

  describe('GET /unknown-route', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/unknown-route-that-does-not-exist');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Not Found');
    });
  });
});
