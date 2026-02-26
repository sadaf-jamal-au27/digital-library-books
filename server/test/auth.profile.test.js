import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';

describe('Auth Profile API', () => {
  let user;
  let token;

  beforeAll(async () => {
    user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      const bcrypt = (await import('bcryptjs')).default;
      user = await User.create({
        email: 'test@example.com',
        password: bcrypt.hashSync('password123', 10),
        name: 'Test User',
      });
    }
    token = signToken({ id: user._id.toString(), email: user.email });
  });

  describe('PUT /api/auth/profile', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).put('/api/auth/profile').send({ name: 'New' });
      expect(res.status).toBe(401);
    });

    it('updates name with valid token', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Name');
    });

    it('updates about and city', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ about: 'Bio here', city: 'NYC' });
      expect(res.status).toBe(200);
      expect(res.body.about).toBe('Bio here');
      expect(res.body.city).toBe('NYC');
    });
  });
});
