'use strict';

const MemoryDB = require('./memory-db');

// Single shared in-memory DB instance
const db = new MemoryDB();

// Write fragment metadata
function writeFragment(ownerId, id, fragment) {
  db.putFragment(ownerId, id, fragment);
  return Promise.resolve();
}

// Read fragment metadata
function readFragment(ownerId, id) {
  return Promise.resolve(db.getFragment(ownerId, id));
}

// Write fragment data (Buffer)
function writeFragmentData(ownerId, id, data) {
  db.putFragmentData(ownerId, id, data);
  return Promise.resolve();
}

// Read fragment data (Buffer)
function readFragmentData(ownerId, id) {
  return Promise.resolve(db.getFragmentData(ownerId, id));
}

// List fragment ids for a user
function listFragments(ownerId, expand = false) {
  return db.listFragments(ownerId).then((fragments) =>
    expand ? fragments : fragments.map((f) => f.id)
  );
}

// Delete fragment (metadata + data)
function deleteFragment(ownerId, id) {
  db.deleteFragment(ownerId, id);
  return Promise.resolve();
}

module.exports = {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
};
