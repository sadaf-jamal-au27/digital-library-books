import bcrypt from 'bcryptjs';
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Book from '../models/Book.js';
import { signToken } from '../middleware/auth.js';

describe('Admin API', () => {
  let adminToken;
  let userToken;
  let bookId;

  beforeAll(async () => {
    let admin = await User.findOne({ email: 'admin-test@example.com' });
    if (!admin) {
      admin = await User.create({
        email: 'admin-test@example.com',
        password: bcrypt.hashSync('admin123', 10),
        name: 'Admin Test',
        role: 'admin',
      });
    }
    let user = await User.findOne({ email: 'user-only@example.com' });
    if (!user) {
      user = await User.create({
        email: 'user-only@example.com',
        password: bcrypt.hashSync('user123', 10),
        name: 'User Only',
        role: 'user',
      });
    }
    adminToken = signToken({ id: admin._id.toString(), email: admin.email });
    userToken = signToken({ id: user._id.toString(), email: user.email });
  });

  describe('POST /api/admin/books', () => {
    it('returns 401 without token', async () => {
      const res = await request(app)
        .post('/api/admin/books')
        .field('title', 'T').field('author', 'A').field('category', 'C').field('book_type', 'eBook');
      expect(res.status).toBe(401);
    });

    it('returns 403 for non-admin user', async () => {
      const res = await request(app)
        .post('/api/admin/books')
        .set('Authorization', `Bearer ${userToken}`)
        .field('title', 'T').field('author', 'A').field('category', 'C').field('book_type', 'eBook');
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/admin/i);
    });

    it('returns 400 when required fields missing', async () => {
      const res = await request(app)
        .post('/api/admin/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Only Title' });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/admin/books/:id', () => {
    it('returns 403 for non-admin', async () => {
      const book = await Book.findOne() || await Book.create({ title: 'B', author: 'A', category: 'F', book_type: 'eBook' });
      const res = await request(app)
        .put(`/api/admin/books/${book._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated' });
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/admin/books/:id', () => {
    it('returns 403 for non-admin', async () => {
      const book = await Book.findOne() || await Book.create({ title: 'Del', author: 'A', category: 'F', book_type: 'eBook' });
      const res = await request(app)
        .delete(`/api/admin/books/${book._id}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });
  });
});
