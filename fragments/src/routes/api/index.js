const express = require('express');
const router = express.Router();

// List all fragment IDs for the authenticated user
router.get('/fragments', require('./get'));

// Create a fragment (A1: text/plain only, raw body)
router.post('/fragments', require('./post'));

// Get a specific fragment by id
router.get('/fragments/:id', require('./one'));

module.exports = router;