const request = require('supertest');
const app = require('../../src/app');

const auth = () => ['user1@email.com', 'password1'];

describe('GET /v1/fragments/:id', () => {
  test('requires auth', async () => {
    const res = await request(app).get('/v1/fragments/abc');
    expect(res.status).toBe(401);
  });

  test('404 for unknown id', async () => {
    const res = await request(app).get('/v1/fragments/nope').auth(...auth());
    expect(res.status).toBe(404);
  });

  test('returns existing fragment and data', async () => {
    const created = await request(app)
      .post('/v1/fragments')
      .auth(...auth())
      .set('Content-Type', 'text/plain')
      .send('abc');
    const id = created.body.fragment.id;

    const got = await request(app).get(`/v1/fragments/${id}`).auth(...auth());
    expect(got.status).toBe(200);
    expect(got.body.status).toBe('ok');
    expect(got.body.fragment.id).toBe(id);
    expect(got.body.fragment.size).toBe(3);
    expect(got.body.data).toBe('abc');
  });
});
