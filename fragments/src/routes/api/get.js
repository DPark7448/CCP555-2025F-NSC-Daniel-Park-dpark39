// src/routes/api/get.js

const { createSuccessResponse } = require('../../response'); 

module.exports = (req, res) => {
  // placeholder: return empty array for now
  res.status(200).json(createSuccessResponse({ fragments: [] }));

};
