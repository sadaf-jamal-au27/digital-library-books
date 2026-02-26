import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Health & root', () => {
  it('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('GET / returns API message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/Digital Library/i);
  });
});
