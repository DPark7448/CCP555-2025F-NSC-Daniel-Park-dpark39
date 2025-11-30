const express = require('express');
const router = express.Router();

router.get('/fragments', require('./get'));
router.get('/fragments/:id', require('./one'));
router.post('/fragments', require('./post'));
router.delete('/fragments/:id', require('./delete'));

module.exports = router;