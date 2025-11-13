const express = require('express');
const router = express.Router();

// Initialize database connection
require('../config/database');

router.use('/auth', require('./auth'));
router.use('/dashboard', require('./dashboard'));
router.use('/attendance', require('./attendance'));
router.use('/dismissal', require('./dismissal'));
router.use('/students', require('./students'));

module.exports = router;
