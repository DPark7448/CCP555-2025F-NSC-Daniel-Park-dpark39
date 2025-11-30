// src/model/data/memory/index.js

const { _fragments, _data } = require('./memory-db');

function key(ownerId, id) {
  return `${ownerId}:${id}`;
}

// ---- Metadata helpers --------------------------------------

function writeFragment(ownerId, fragment) {
  const k = key(ownerId, fragment.id);
  _fragments.set(k, fragment);
}

function readFragment(ownerId, id) {
  const k = key(ownerId, id);
  return _fragments.get(k);
}

function listFragments(ownerId, expand = false) {
  const prefix = `${ownerId}:`;

  const entries = [..._fragments.entries()].filter(([k]) =>
    k.startsWith(prefix),
  );

  if (expand) {
    // return fragment objects
    return entries.map(([, frag]) => frag);
  }

  // return just ids
  return entries.map(([, frag]) => frag.id);
}

function deleteFragment(ownerId, id) {
  const k = key(ownerId, id);
  _fragments.delete(k);
  _data.delete(k);
}

// ---- Data helpers (for non-AWS mode) -----------------------

async function writeFragmentData(ownerId, id, data) {
  const k = key(ownerId, id);
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
  _data.set(k, buf);
}

async function readFragmentData(ownerId, id) {
  const k = key(ownerId, id);
  return _data.get(k);
}

async function deleteFragmentData(ownerId, id) {
  const k = key(ownerId, id);
  _data.delete(k);
}

module.exports = {
  writeFragment,
  readFragment,
  listFragments,
  deleteFragment,
  writeFragmentData,
  readFragmentData,
  deleteFragmentData,
};
