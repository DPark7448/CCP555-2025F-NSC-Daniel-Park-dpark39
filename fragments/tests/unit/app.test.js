// fragments/tests/unit/app.test.js
const request = require('supertest');
const app = require('../../src/app'); // from tests/unit -> ../../src/app

describe('404 handler', () => {
  test('unknown route returns 404 with an error payload', async () => {
    const res = await request(app)
      .get('/__definitely_not_a_real_route__')
      .set('Accept', 'application/json');

    expect(res.status).toBe(404);

    if (res.headers['content-type']) {
      expect(res.headers['content-type']).toMatch(/json/i);
    }
    expect(res.body).toMatchObject({
      status: 'error',
      error: { code: 404 },
    });

    if (res.body?.error?.message) {
      const msg = res.body.error.message.toLowerCase();
      expect(msg).toContain('not');
      expect(msg).toContain('found');
    }
  });
});
