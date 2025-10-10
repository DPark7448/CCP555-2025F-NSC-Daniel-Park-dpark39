const request = require('supertest');
const app = require('../../src/app');

const auth = () => ['user1@email.com', 'password1'];

describe('POST /v1/fragments', () => {
  test('requires auth', async () => {
    const res = await request(app).post('/v1/fragments').set('Content-Type', 'text/plain').send('x');
    expect(res.status).toBe(401);
  });

  test('rejects unsupported content-type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(...auth())
      .set('Content-Type', 'text/html')
      .send('<h1>x</h1>');
    expect(res.status).toBe(415);
  });

  test('creates text/plain fragment, returns Location + metadata', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(...auth())
      .set('Content-Type', 'text/plain')
      .send('hello');
    expect(res.status).toBe(201);
    expect(res.headers.location).toMatch(/\/v1\/fragments\/[0-9a-f-]+/i);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.type).toBe('text/plain');
    expect(res.body.fragment.size).toBe(5);
  });
});
