const fragments = new Map();   // key: `${ownerId}:${id}`  -> metadata
const data = new Map();        // key: `${ownerId}:${id}:data` -> Buffer

module.exports = { _fragments: fragments, _data: data };