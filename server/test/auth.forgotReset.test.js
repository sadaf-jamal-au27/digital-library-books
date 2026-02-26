import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import { signToken } from '../middleware/auth.js';

vi.mock('../lib/mail.js', () => ({
  isMailConfigured: vi.fn(() => true),
  sendOtpEmail: vi.fn(() => Promise.resolve()),
}));

describe('Auth Forgot/Reset Password API', () => {
  const email = 'forgot@example.com';

  beforeAll(async () => {
    const bcrypt = (await import('bcryptjs')).default;
    await Otp.deleteMany({});
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        password: bcrypt.hashSync('oldpass', 10),
        name: 'Forgot User',
      });
    }
  });

  describe('POST /api/auth/forgot-password', () => {
    it('returns 400 when email missing', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/email is required/i);
    });

    it('returns 200 and message when mail configured (mocked)', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email });
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/account exists|OTP/i);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('returns 400 when email, otp or newPassword missing', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ email: 'a@b.com' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/required/i);
    });

    it('returns 400 when newPassword too short', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ email: 'a@b.com', otp: '123456', newPassword: '12345' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/6 characters/i);
    });

    it('returns 400 for invalid OTP', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ email, otp: '000000', newPassword: 'newpass123' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid|expired/i);
    });

    it('returns 200 when valid OTP', async () => {
      await Otp.findOneAndUpdate(
        { email },
        { otp: '123456', expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
        { upsert: true }
      );
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ email, otp: '123456', newPassword: 'newpass123' });
      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/reset successfully/i);
    });
  });
});
