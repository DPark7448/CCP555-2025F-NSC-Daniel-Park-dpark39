// src/model/fragment.js

const crypto = require('crypto');
const store = require('./data');

// Types we support
const SUPPORTED_TYPES = new Set([
  'text/plain',
  'text/plain; charset=utf-8',
  'text/markdown',
  // NOTE: text/html is intentionally NOT supported for this lab
  'application/json',
]);

class Fragment {
  constructor({ ownerId, type, id, created, updated, size = 0, raw = false }) {
    if (!ownerId) throw new Error('ownerId required');
    if (!Fragment.isSupportedType(type)) {
      throw new Error(`unsupported type: ${type}`);
    }

    this.ownerId = ownerId;
    this.type = type;
    this.id = id || crypto.randomUUID();

    const now = new Date().toISOString();
    this.created = created || now;
    this.updated = updated || now;
    this.size = size;
    this.raw = raw;
  }

  static isSupportedType(type) {
    if (!type) return false;
    // normalize things like "text/plain; charset=utf-8"
    const base = type.split(';')[0].trim();
    return SUPPORTED_TYPES.has(type) || SUPPORTED_TYPES.has(base);
  }

  // Look up a single fragment by owner + id
  static async byId(ownerId, id) {
    const meta = await store.readFragment(ownerId, id);
    return meta ? new Fragment(meta) : null;
  }

  // List all fragments for a user
  static async byUser(ownerId, expand = false) {
    return store.listFragments(ownerId, expand);
  }

  // Delete a fragment (metadata + data)
  static async delete(ownerId, id) {
    return store.deleteFragment(ownerId, id);
  }

  // Persist metadata + optional data
  async save(dataBuffer) {
    if (dataBuffer) {
      this.size = Buffer.byteLength(dataBuffer);
      await store.writeFragmentData(this.ownerId, this.id, dataBuffer);
    }
    this.updated = new Date().toISOString();
    await store.writeFragment({ ...this });
    return this;
  }

  // Load data from backend (S3 or memory)
  async data() {
    return store.readFragmentData(this.ownerId, this.id);
  }
}

module.exports = Fragment;
