const { _fragments, _data } = require('./memory-db');

const key = (ownerId, id) => `${ownerId}:${id}`;
const dataKey = (ownerId, id) => `${ownerId}:${id}:data`;

async function readFragment(ownerId, id) {
  return _fragments.get(key(ownerId, id)) || null;
}
async function writeFragment(ownerId, id, fragment) {
  _fragments.set(key(ownerId, id), fragment);
}
async function readFragmentData(ownerId, id) {
  return _data.get(dataKey(ownerId, id)) || null;
}
async function writeFragmentData(ownerId, id, buf) {
  _data.set(dataKey(ownerId, id), Buffer.from(buf));
}

module.exports = {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
};
