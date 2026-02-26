import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import Book from '../models/Book.js';

describe('Books API', () => {
  beforeAll(async () => {
    await Book.deleteMany({});
    await Book.create([
      { title: 'Book A', author: 'Author A', category: 'Fiction', book_type: 'eBook' },
      { title: 'Book B', author: 'Author B', category: 'Tech', book_type: 'PDF' },
    ]);
  });

  describe('GET /api/books', () => {
    it('returns paginated list of books', async () => {
      const res = await request(app).get('/api/books');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.books)).toBe(true);
      expect(res.body.books.length).toBe(2);
      expect(res.body.total).toBe(2);
      expect(res.body.page).toBe(1);
      expect(res.body.totalPages).toBe(1);
      expect(res.body.books[0]).toHaveProperty('id');
      expect(res.body.books[0]).not.toHaveProperty('_id');
    });

    it('filters by category', async () => {
      const res = await request(app).get('/api/books?category=Fiction');
      expect(res.status).toBe(200);
      expect(res.body.books.length).toBe(1);
      expect(res.body.books[0].category).toBe('Fiction');
    });

    it('filters by search q', async () => {
      const res = await request(app).get('/api/books?q=Author%20B');
      expect(res.status).toBe(200);
      expect(res.body.books.length).toBeGreaterThanOrEqual(1);
      expect(res.body.books.some((b) => b.author === 'Author B')).toBe(true);
    });
  });

  describe('GET /api/books/categories', () => {
    it('returns distinct categories', async () => {
      const res = await request(app).get('/api/books/categories');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toContain('Fiction');
      expect(res.body).toContain('Tech');
    });
  });

  describe('GET /api/books/:id', () => {
    it('returns 404 for invalid id', async () => {
      const res = await request(app).get('/api/books/000000000000000000000000');
      expect(res.status).toBe(404);
    });

    it('returns book by id', async () => {
      const book = await Book.findOne({ title: 'Book A' });
      const res = await request(app).get(`/api/books/${book._id}`);
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Book A');
      expect(res.body.id).toBe(book._id.toString());
    });
  });
});
