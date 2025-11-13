const express = require('express');
const router = express.Router();
const connectDatabase = require('../config/database');

// Initialize database connection
let dbConnection = null;

(async () => {
  try {
    dbConnection = await connectDatabase();
    // Make connection available to models
    module.exports.dbConnection = dbConnection;
  } catch (error) {
    console.error('Failed to connect to Family Wallet database:', error);
  }
})();

// Routes
router.use('/auth', require('./auth'));
router.use('/families', require('./families'));
router.use('/wallets', require('./wallets'));
router.use('/budgets', require('./budgets'));
router.use('/notifications', require('./notifications'));
router.use('/payments', require('./payments'));

module.exports = router;
