// src/routes/api/get.js

const Fragment = require('../../model/fragment');
const { createSuccessResponse } = require('../../response');

module.exports = async (req, res) => {
  const expand = req.query.expand === '1' || req.query.expand === 'true';
  const fragments = await Fragment.byUser(req.user.ownerId, expand);
  res.status(200).json(createSuccessResponse({ fragments }));
};
