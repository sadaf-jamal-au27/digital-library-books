import bcrypt from 'bcryptjs';
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Book from '../models/Book.js';
import UserBook from '../models/UserBook.js';
import { signToken } from '../middleware/auth.js';

describe('User Books API', () => {
  let userToken;
  let bookId;

  beforeAll(async () => {
    await UserBook.deleteMany({});
    let user = await User.findOne({ email: 'ubooks@example.com' });
    if (!user) {
      user = await User.create({
        email: 'ubooks@example.com',
        password: bcrypt.hashSync('pass123', 10),
        name: 'UBooks User',
      });
    }
    const book = await Book.findOne({ title: 'My Book' }) || await Book.create({ title: 'My Book', author: 'Me', category: 'Fiction', book_type: 'eBook' });
    userToken = signToken({ id: user._id.toString(), email: user.email });
    bookId = book._id.toString();
  });

  it('GET /api/user-books returns 401 without token', async () => {
    const res = await request(app).get('/api/user-books');
    expect(res.status).toBe(401);
  });

  it('POST /api/user-books/:bookId adds book to library', async () => {
    const res = await request(app)
      .post(`/api/user-books/${bookId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect([201, 409]).toContain(res.status);
    if (res.status === 201) expect(res.body.added).toBe(true);
  });

  it('GET /api/user-books returns user books', async () => {
    const res = await request(app)
      .get('/api/user-books')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
