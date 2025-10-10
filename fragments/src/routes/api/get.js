// src/routes/api/get.js

const { createSuccessResponse } = require('../../response'); 
const Fragment = require('../../model/fragment');

module.exports = (req, res) => {
  // placeholder: return empty array for now
  res.status(200).json(createSuccessResponse({ fragments: [] }));

};
module.exports = async (req, res) => {
  // req.user.ownerId is set by our auth-middleware (hashed email)
  const fragments = await Fragment.byUser(req.user.ownerId);
  res.status(200).json(createSuccessResponse({ fragments }));
};
