// fragments/tests/unit/app.test.js
const request = require('supertest');
const app = require('../../src/app'); // from tests/unit -> ../../src/app

describe('404 handler', () => {
  test('unknown route returns 404 with an error payload', async () => {
    const res = await request(app)
      .get('/__definitely_not_a_real_route__')
      .set('Accept', 'application/json');

    expect(res.status).toBe(404);

    // If your 404 returns JSON:
    if (res.headers['content-type']) {
      expect(res.headers['content-type']).toMatch(/json/i);
    }

    // Match your standardized error shape (tweak if yours differs)
    expect(res.body).toMatchObject({
      status: 'error',
      error: { code: 404 },
    });

    // Optional check for message text if present
    if (res.body?.error?.message) {
      const msg = res.body.error.message.toLowerCase();
      expect(msg).toContain('not');
      expect(msg).toContain('found');
    }
  });
});
