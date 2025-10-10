const { _fragments, _data } = require('../../src/model/data/memory/memory-db');

test('memory stores start empty', () => {
  expect(_fragments.size).toBe(0);
  expect(_data.size).toBe(0);
});
