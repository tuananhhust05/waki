const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const getWalletModel = require('../models/Wallet');
const getTransactionModel = require('../models/Transaction');
const getFamilyModel = require('../models/Family');
const getFamilyMemberModel = require('../models/FamilyMember');
const getUserModel = require('../models/User');
const router = express.Router();

router.get('/my-wallet', authenticateToken, async (req, res) => {
  try {
    const Wallet = await getWalletModel();
    const wallet = await Wallet.findOne({ user_id: req.user.id });
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }
    res.json({ wallet });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/family-wallets', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Load all models first to ensure they are registered
    const User = await getUserModel();
    const Family = await getFamilyModel();
    const FamilyMember = await getFamilyMemberModel();
    const Wallet = await getWalletModel();
    
    const family = await Family.findOne({
      $or: [
        { parent_id: userId },
        { _id: { $in: await FamilyMember.distinct('family_id', { user_id: userId }) } }
      ]
    });

    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    const wallets = await Wallet.find({ family_id: family._id })
      .populate('user_id', 'full_name email');

    res.json({
      wallets: wallets
        .filter(w => w.user_id) // Filter out wallets with null user_id
        .map(w => ({
          id: w._id,
          user_id: w.user_id._id,
          family_id: w.family_id,
          balance: w.balance,
          currency: w.currency,
          full_name: w.user_id.full_name,
          email: w.user_id.email
        }))
    });
  } catch (error) {
    console.error('Get family wallets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/add-funds', authenticateToken, async (req, res) => {
  try {
    const { amount, wallet_id } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const Wallet = await getWalletModel();
    const Transaction = await getTransactionModel();
    const mongoose = require('mongoose');

    const wallet = await Wallet.findOne({ 
      _id: mongoose.isValidObjectId(wallet_id) ? new mongoose.Types.ObjectId(wallet_id) : wallet_id,
      user_id: req.user.id 
    });
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    wallet.balance += parseFloat(amount);
    wallet.updated_at = new Date();
    await wallet.save();

    const transaction = new Transaction({
      wallet_id: wallet._id,
      user_id: req.user.id,
      amount: parseFloat(amount),
      type: 'credit',
      category: 'deposit',
      description: 'Funds added',
      status: 'completed'
    });
    await transaction.save();

    res.json({ message: 'Funds added successfully' });
  } catch (error) {
    console.error('Add funds error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const Wallet = await getWalletModel();
    const Transaction = await getTransactionModel();

    const wallets = await Wallet.find({ user_id: req.user.id });
    const walletIds = wallets.map(w => w._id);

    const transactions = await Transaction.find({ wallet_id: { $in: walletIds } })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('wallet_id', 'balance');

    res.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
