import request from 'supertest';
import app from '../../src/app.js';

describe('Health check', () => {
  it('GET /test returns Hello!', async () => {
    const res = await request(app).get('/test');

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello!');
  });
});
