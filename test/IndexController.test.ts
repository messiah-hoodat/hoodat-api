import request from 'supertest';

import App from '../src/App';

let app: App;

beforeAll(async () => {
  app = new App();
  await app.start();
});

afterAll(async () => {
  await app.stop();
});

describe('GET /', () => {
  test('should return status message', async () => {
    const response = await request(app.express).get('/api');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'The service is up and running!');
  });
});