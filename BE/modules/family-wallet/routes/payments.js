const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const getWalletModel = require('../models/Wallet');
const getTransactionModel = require('../models/Transaction');
const getUserModel = require('../models/User');
const getNotificationModel = require('../models/Notification');
const router = express.Router();

// Simulate payment gateway (Mastercard/Visa)
router.post('/process-payment', authenticateToken, async (req, res) => {
  try {
    const { amount, cardNumber, cardHolder, expiryDate, cvv, cardType } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!cardNumber || !cardHolder || !expiryDate || !cvv || !cardType) {
      return res.status(400).json({ error: 'Missing card information' });
    }

    // Validate card type
    if (!['mastercard', 'visa'].includes(cardType.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid card type. Only Mastercard and Visa are accepted' });
    }

    // Simulate payment processing (always success for demo)
    // In real app, this would call actual payment gateway API
    const paymentResult = {
      success: true,
      transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      amount: parseFloat(amount),
      cardType: cardType.toLowerCase(),
      timestamp: new Date()
    };

    // Add funds to parent wallet
    const Wallet = await getWalletModel();
    const Transaction = await getTransactionModel();
    const User = await getUserModel();

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can add funds' });
    }

    const wallet = await Wallet.findOne({ user_id: req.user.id });
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // Update wallet balance
    wallet.balance += parseFloat(amount);
    wallet.updated_at = new Date();
    await wallet.save();

    // Create transaction record
    const transaction = new Transaction({
      wallet_id: wallet._id,
      user_id: req.user.id,
      amount: parseFloat(amount),
      type: 'credit',
      category: 'deposit',
      description: `Payment via ${cardType}`,
      payment_method: cardType.toLowerCase(),
      status: 'completed'
    });
    await transaction.save();

    res.json({
      message: 'Payment processed successfully',
      transaction: paymentResult,
      newBalance: wallet.balance
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Transfer money from parent to child
router.post('/transfer-to-child', authenticateToken, async (req, res) => {
  try {
    const { childUserId, amount, description } = req.body;

    if (!childUserId) {
      return res.status(400).json({ error: 'Missing childUserId' });
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount. Amount must be greater than 0' });
    }

    const Wallet = await getWalletModel();
    const Transaction = await getTransactionModel();
    const User = await getUserModel();
    const Notification = await getNotificationModel();
    const getFamilyModel = require('../models/Family');
    const getFamilyMemberModel = require('../models/FamilyMember');
    const Family = await getFamilyModel();
    const FamilyMember = await getFamilyMemberModel();

    // Check if user is parent
    const parent = await User.findById(req.user.id);
    if (!parent || parent.role !== 'parent') {
      return res.status(403).json({ error: 'Only parents can transfer money' });
    }

    // Check if child belongs to parent's family
    const family = await Family.findOne({ parent_id: req.user.id });
    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    const isChild = await FamilyMember.findOne({
      family_id: family._id,
      user_id: childUserId
    });

    if (!isChild) {
      return res.status(403).json({ error: 'Child not found in your family' });
    }

    // Get parent wallet
    const parentWallet = await Wallet.findOne({ user_id: req.user.id });
    if (!parentWallet) {
      return res.status(404).json({ error: 'Parent wallet not found' });
    }

    if (parentWallet.balance < parseFloat(amount)) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Get or create child wallet
    let childWallet = await Wallet.findOne({ user_id: childUserId });
    if (!childWallet) {
      childWallet = new Wallet({
        user_id: childUserId,
        family_id: family._id,
        balance: 0,
        currency: 'SAR'
      });
      await childWallet.save();
    }

    // Deduct from parent
    parentWallet.balance -= parseFloat(amount);
    parentWallet.updated_at = new Date();
    await parentWallet.save();

    // Add to child
    childWallet.balance += parseFloat(amount);
    childWallet.updated_at = new Date();
    await childWallet.save();

    // Create transactions
    const parentTransaction = new Transaction({
      wallet_id: parentWallet._id,
      user_id: req.user.id,
      amount: parseFloat(amount),
      type: 'debit',
      category: 'transfer',
      description: description || `Transfer to child`,
      status: 'completed'
    });
    await parentTransaction.save();

    const childTransaction = new Transaction({
      wallet_id: childWallet._id,
      user_id: childUserId,
      amount: parseFloat(amount),
      type: 'credit',
      category: 'transfer',
      description: description || `Received from parent`,
      status: 'completed'
    });
    await childTransaction.save();

    // Create notification for child
    const childNotification = new Notification({
      user_id: childUserId,
      family_id: family._id,
      type: 'money_received',
      title: 'Money Received',
      message: `You received ${parseFloat(amount).toFixed(2)} SAR from ${parent.full_name}`,
      is_read: false
    });
    await childNotification.save();

    // Get socket.io instance and emit notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${childUserId}`).emit('notification', {
        type: 'money_received',
        title: 'Money Received',
        message: `You received ${parseFloat(amount).toFixed(2)} SAR from ${parent.full_name}`,
        notification: childNotification,
        newBalance: childWallet.balance
      });
    }

    res.json({
      message: 'Money transferred successfully',
      childBalance: childWallet.balance,
      parentBalance: parentWallet.balance
    });
  } catch (error) {
    console.error('Transfer to child error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create expense/payment (for both parent and child)
router.post('/create-expense', authenticateToken, async (req, res) => {
  try {
    const { amount, merchant, description, category } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const Wallet = await getWalletModel();
    const Transaction = await getTransactionModel();
    const User = await getUserModel();
    const Notification = await getNotificationModel();
    const getFamilyModel = require('../models/Family');
    const Family = await getFamilyModel();

    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get wallet
    const wallet = await Wallet.findOne({ user_id: req.user.id });
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    if (wallet.balance < parseFloat(amount)) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Deduct from wallet
    wallet.balance -= parseFloat(amount);
    wallet.updated_at = new Date();
    await wallet.save();

    // Create transaction
    const transaction = new Transaction({
      wallet_id: wallet._id,
      user_id: req.user.id,
      amount: parseFloat(amount),
      type: 'debit',
      category: category || 'expense',
      description: description || `Payment to ${merchant || 'Merchant'}`,
      status: 'completed'
    });
    await transaction.save();

    // If child makes payment, notify parent
    if (user.role === 'member') {
      const family = await Family.findById(wallet.family_id);
      if (family && family.parent_id) {
        const parentNotification = new Notification({
          user_id: family.parent_id,
          family_id: family._id,
          type: 'child_payment',
          title: 'Child Payment',
          message: `${user.full_name} made a payment of ${parseFloat(amount).toFixed(2)} SAR${merchant ? ` to ${merchant}` : ''}${description ? ` - ${description}` : ''}`,
          is_read: false
        });
        await parentNotification.save();

        // Get socket.io instance and emit notification
        const io = req.app.get('io');
        if (io) {
          io.to(`user_${family.parent_id}`).emit('notification', {
            type: 'child_payment',
            title: 'Child Payment',
            message: `${user.full_name} made a payment of ${parseFloat(amount).toFixed(2)} SAR${merchant ? ` to ${merchant}` : ''}${description ? ` - ${description}` : ''}`,
            notification: parentNotification
          });
        }
      }
    }

    res.json({
      message: 'Expense created successfully',
      newBalance: wallet.balance,
      transaction: transaction
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Child makes a payment (kept for backward compatibility - uses create-expense)
router.post('/child-payment', authenticateToken, async (req, res) => {
  // Set category to payment and forward to create-expense logic
  req.body.category = 'payment';
  
  // Reuse create-expense logic
  try {
    const { amount, merchant, description, category } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const Wallet = await getWalletModel();
    const Transaction = await getTransactionModel();
    const User = await getUserModel();
    const Notification = await getNotificationModel();
    const getFamilyModel = require('../models/Family');
    const Family = await getFamilyModel();

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'member') {
      return res.status(403).json({ error: 'Only children can use this endpoint' });
    }

    const wallet = await Wallet.findOne({ user_id: req.user.id });
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    if (wallet.balance < parseFloat(amount)) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    wallet.balance -= parseFloat(amount);
    wallet.updated_at = new Date();
    await wallet.save();

    const transaction = new Transaction({
      wallet_id: wallet._id,
      user_id: req.user.id,
      amount: parseFloat(amount),
      type: 'debit',
      category: category || 'payment',
      description: description || `Payment to ${merchant || 'Merchant'}`,
      status: 'completed'
    });
    await transaction.save();

    const family = await Family.findById(wallet.family_id);
    if (family && family.parent_id) {
      const parentNotification = new Notification({
        user_id: family.parent_id,
        family_id: family._id,
        type: 'child_payment',
        title: 'Child Payment',
        message: `${user.full_name} made a payment of ${parseFloat(amount).toFixed(2)} SAR${merchant ? ` to ${merchant}` : ''}${description ? ` - ${description}` : ''}`,
        is_read: false
      });
      await parentNotification.save();

      const io = req.app.get('io');
      if (io) {
        io.to(`user_${family.parent_id}`).emit('notification', {
          type: 'child_payment',
          title: 'Child Payment',
          message: `${user.full_name} made a payment of ${parseFloat(amount).toFixed(2)} SAR${merchant ? ` to ${merchant}` : ''}${description ? ` - ${description}` : ''}`,
          notification: parentNotification
        });
      }
    }

    res.json({
      message: 'Payment processed successfully',
      newBalance: wallet.balance,
      transaction: transaction
    });
  } catch (error) {
    console.error('Child payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

