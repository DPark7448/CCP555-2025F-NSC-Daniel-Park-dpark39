const Fragment = require('../../src/model/fragment');

test('supported types', () => {
  expect(Fragment.isSupportedType('text/plain')).toBe(true);
  expect(Fragment.isSupportedType('text/html')).toBe(false);
});

test('save and fetch by id', async () => {
  const f = new Fragment({ ownerId: 'u', type: 'text/plain' });
  await f.save(Buffer.from('abc'));
  const got = await Fragment.byId('u', f.id);
  expect(got).toBeTruthy();
  expect(got.size).toBe(3);
});

test('list by user returns ids', async () => {
  const f = new Fragment({ ownerId: 'u2', type: 'text/plain' });
  await f.save(Buffer.from('x'));
  const ids = await Fragment.byUser('u2');
  expect(ids).toContain(f.id);
});
