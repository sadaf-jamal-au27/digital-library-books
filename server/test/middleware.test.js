import { describe, it, expect } from 'vitest';
import { signToken } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'digital-library-secret-change-in-production';

describe('Auth middleware (unit)', () => {
  describe('signToken', () => {
    it('returns a valid JWT', () => {
      const payload = { id: '123', email: 'u@x.com' };
      const token = signToken(payload);
      expect(typeof token).toBe('string');
      const decoded = jwt.verify(token, JWT_SECRET);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.exp).toBeDefined();
    });
  });
});
