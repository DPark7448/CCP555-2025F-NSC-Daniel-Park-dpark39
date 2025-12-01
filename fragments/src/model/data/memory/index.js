'use strict';

const MemoryDB = require('./memory-db');

// Single shared in-memory DB instance
const db = new MemoryDB();

// Write fragment metadata
function writeFragment(ownerId, id, fragment) {
  return db.putFragment(ownerId, id, fragment);
}

// Read fragment metadata
function readFragment(ownerId, id) {
  return db.getFragment(ownerId, id);
}

// Write fragment data (Buffer)
function writeFragmentData(ownerId, id, data) {
  return db.putFragmentData(ownerId, id, data);
}

// Read fragment data (Buffer)
function readFragmentData(ownerId, id) {
  return db.getFragmentData(ownerId, id);
}

// List fragment ids for a user
function listFragments(ownerId, expand = false) {
  return db.listFragments(ownerId).then((fragments) =>
    expand ? fragments : fragments.map((f) => f.id)
  );
}

// Delete fragment (metadata + data)
function deleteFragment(ownerId, id) {
  return db.deleteFragment(ownerId, id);
}

module.exports = {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
};
