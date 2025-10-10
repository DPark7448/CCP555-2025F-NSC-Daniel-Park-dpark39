const crypto = require('crypto');
const store = require('./data');
const { _fragments } = require('./data/memory/memory-db');

const SUPPORTED = new Set(['text/plain']);

class Fragment {
  constructor({ ownerId, type, id, created, updated, size = 0 }) {
    if (!ownerId) throw new Error('ownerId required');
    if (!Fragment.isSupportedType(type)) throw new Error('unsupported type');

    this.ownerId = ownerId;
    this.type = type;
    this.id = id || crypto.randomUUID();
    const now = new Date().toISOString();
    this.created = created || now;
    this.updated = updated || now;
    this.size = size;
  }

  static isSupportedType(type) {
    return SUPPORTED.has(type);
  }

  static async byId(ownerId, id) {
    const meta = await store.readFragment(ownerId, id);
    return meta ? new Fragment(meta) : null;
  }

  static async byUser(ownerId) {
    // List all ids for this owner
    return Array.from(_fragments.entries())
      .filter(([k]) => k.startsWith(`${ownerId}:`))
      .map(([, v]) => v.id);
  }

  async save(dataBuffer) {
    if (dataBuffer) {
      this.size = Buffer.byteLength(dataBuffer);
      await store.writeFragmentData(this.ownerId, this.id, dataBuffer);
    }
    this.updated = new Date().toISOString();
    await store.writeFragment(this.ownerId, this.id, { ...this });
    return this;
  }

  async data() {
    return store.readFragmentData(this.ownerId, this.id);
  }
}

module.exports = Fragment;
