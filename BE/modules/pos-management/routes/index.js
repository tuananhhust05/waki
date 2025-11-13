const express = require('express');
const router = express.Router();

// Initialize database connection
require('../config/database');

router.use('/auth', require('./auth'));
router.use('/products', require('./products'));
router.use('/sales', require('./sales'));

module.exports = router;
