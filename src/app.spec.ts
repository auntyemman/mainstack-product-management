import supertest from 'supertest';
import { createApp } from './app';

describe('App', () => {
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(() => {
    const app = createApp();
    request = supertest(app) as unknown as supertest.SuperTest<supertest.Test>;
  });

  it('should respond with 200 on GET /', async () => {
    const response = await request.get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello, Mainstack!.');
  });

  it('should respond with a 404 for unknown routes', async () => {
    const response = await request.get('/unknown-route');
    expect(response.status).toBe(404);
  });

  it('should apply middleware correctly', async () => {
    const response = await request.get('/api/v1/users');
    expect(response.status).not.toBe(500); // Expect not to hit error handler
  });

  it('should handle errors', async () => {
    const response = await request.get('/api/v1/invalid');
    expect(response.status).toBe(404); // Expect the error handling middleware to handle this
  });
});
