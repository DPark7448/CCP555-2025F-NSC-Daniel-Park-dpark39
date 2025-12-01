'use strict';

// Shared in-memory maps for fragment metadata and data
const _fragments = new Map();
const _data = new Map();

class MemoryDB {
  constructor() {
    // expose the maps mainly for the unit tests
    this.fragments = _fragments;
    this.data = _data;
  }

  _key(ownerId, id) {
    return `${ownerId}|${id}`;
  }

  // --- Fragment metadata ---

  async putFragment(ownerId, id, fragment) {
    const key = this._key(ownerId, id);
    this.fragments.set(key, { ...fragment });
    return fragment;
  }

  async getFragment(ownerId, id) {
    const key = this._key(ownerId, id);
    return this.fragments.get(key);
  }

  async queryFragments(ownerId) {
    const results = [];
    for (const [key, value] of this.fragments.entries()) {
      const [oid] = key.split('|');
      if (oid === ownerId) {
        results.push(value);
      }
    }
    return results;
  }

  async delFragment(ownerId, id) {
    const key = this._key(ownerId, id);
    this.fragments.delete(key);
  }

  // --- Fragment data (Buffers) ---

  async putFragmentData(ownerId, id, data) {
    const key = this._key(ownerId, id);
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
    this.data.set(key, buf);
    return buf;
  }

  async getFragmentData(ownerId, id) {
    const key = this._key(ownerId, id);
    return this.data.get(key);
  }

  async delFragmentData(ownerId, id) {
    const key = this._key(ownerId, id);
    this.data.delete(key);
  }

  async listFragments(ownerId) {
    return this.queryFragments(ownerId);
  }

  // delete both metadata + data
  async deleteFragment(ownerId, id) {
    await this.delFragment(ownerId, id);
    await this.delFragmentData(ownerId, id);
  }
}

// default export: class
module.exports = MemoryDB;
// named exports for tests
module.exports._fragments = _fragments;
module.exports._data = _data;
