const express = require('express');
const router = express.Router();

// Initialize database connection
require('../config/database');

router.use('/auth', require('./auth'));
router.use('/ai', require('./ai'));

module.exports = router;
