// src/routes/index.js
const express = require('express');
const router = express.Router();
const { version, author } = require('../../package.json');
const { authenticate } = require('../auth');
const { hostname } = require('os'); // 👈 add this

// Health (public)
router.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({
    status: 'ok',
    author,
    githubUrl: 'https://github.com/DPark7448/fragments',
    version,
    hostname: hostname(), // 👈 add this
  });
});

router.use('/v1', authenticate(), require('./api'));

module.exports = router;
