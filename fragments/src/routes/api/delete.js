// src/routes/api/delete.js

const Fragment = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');

module.exports = async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user.ownerId;

  // Make sure it exists first
  const frag = await Fragment.byId(ownerId, id);
  if (!frag) {
    return res.status(404).json(createErrorResponse(404, 'Not Found'));
  }

  // Delete via the data store (S3 + metadata)
  await Fragment.delete(ownerId, id);

  return res.status(200).json(createSuccessResponse());
};
