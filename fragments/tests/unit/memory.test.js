const store = require('../../src/model/data');

test('write/read fragment meta', async () => {
  await store.writeFragment('u', 'a1', { id: 'a1', ownerId: 'u', type: 'text/plain' });
  const meta = await store.readFragment('u', 'a1');
  expect(meta).toMatchObject({ id: 'a1', ownerId: 'u', type: 'text/plain' });
});

test('write/read fragment data', async () => {
  await store.writeFragmentData('u', 'a1', Buffer.from('hello'));
  const buf = await store.readFragmentData('u', 'a1');
  expect(Buffer.isBuffer(buf)).toBe(true);
  expect(buf.toString()).toBe('hello');
});