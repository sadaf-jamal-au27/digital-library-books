import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';

describe('Auth API', () => {
  const testUser = { email: 'test@example.com', password: 'password123', name: 'Test User' };

  beforeAll(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/signup', () => {
    it('returns 400 when email, password or name is missing', async () => {
      const res = await request(app).post('/api/auth/signup').send({ email: 'a@b.com' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/required/i);
    });

    it('returns 400 when password is too short', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'a@b.com', password: '12345', name: 'Ab' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/6 characters/);
    });

    it('creates user and returns user + token', async () => {
      const res = await request(app).post('/api/auth/signup').send(testUser);
      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.user.name).toBe(testUser.name);
      expect(res.body.user.password).toBeUndefined();
    });

    it('returns 409 when email already registered', async () => {
      const res = await request(app).post('/api/auth/signup').send(testUser);
      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already registered/i);
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns 400 when email or password missing', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com' });
      expect(res.status).toBe(400);
    });

    it('returns 401 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrong' });
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/invalid/i);
    });

    it('returns user + token for valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns 401 for invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(401);
    });

    it('returns user when valid token', async () => {
      const user = await User.findOne({ email: testUser.email });
      const token = signToken({ id: user._id.toString(), email: user.email });
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.email).toBe(testUser.email.toLowerCase());
    });
  });
});
