const request = require('supertest');
const app = require('../../src/app');

const auth = () => ['user1@email.com', 'password1'];

describe('DELETE /v1/fragments/:id', () => {
  test('requires auth', async () => {
    const res = await request(app).delete('/v1/fragments/abc');
    expect(res.status).toBe(401);
  });

  test('404 for unknown id', async () => {
    const res = await request(app).delete('/v1/fragments/missing').auth(...auth());
    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
  });

  test('deletes an existing fragment and its data', async () => {
    const created = await request(app)
      .post('/v1/fragments')
      .auth(...auth())
      .set('Content-Type', 'text/plain')
      .send('to delete');

    const { id } = created.body.fragment;

    const deleted = await request(app).delete(`/v1/fragments/${id}`).auth(...auth());
    expect(deleted.status).toBe(200);
    expect(deleted.body.status).toBe('ok');

    const afterDelete = await request(app).get(`/v1/fragments/${id}`).auth(...auth());
    expect(afterDelete.status).toBe(404);
  });
});
