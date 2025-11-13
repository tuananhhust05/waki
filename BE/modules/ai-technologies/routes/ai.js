const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const getTransactionModel = require('../models/Transaction');
const mongoose = require('mongoose');
const router = express.Router();

router.post('/analyze-transaction', authenticateToken, async (req, res) => {
  try {
    const { amount, transaction_type, category } = req.body;
    const Transaction = await getTransactionModel();

    const userId = req.user.id;
    const avgResult = await Transaction.aggregate([
      { $match: { user_id: userId, transaction_type } },
      { $group: { _id: null, avg_amount: { $avg: '$amount' } } }
    ]);

    const avgAmount = avgResult[0]?.avg_amount || 0;
    const isAnomaly = amount > avgAmount * 3 || amount < avgAmount * 0.1;
    const anomalyScore = isAnomaly ? 85.5 : 15.2;

    const transaction = new Transaction({
      user_id: userId,
      amount: parseFloat(amount),
      transaction_type,
      category: category || null,
      is_anomaly: isAnomaly,
      anomaly_score: anomalyScore
    });
    await transaction.save();

    res.json({
      transaction,
      is_anomaly: isAnomaly,
      anomaly_score: anomalyScore
    });
  } catch (error) {
    console.error('Analyze transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const Transaction = await getTransactionModel();
    const transactions = await Transaction.find({ user_id: req.user.id })
      .sort({ created_at: -1 })
      .limit(100);

    const totalSpent = transactions
      .filter(t => t.transaction_type === 'debit')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const anomalies = transactions.filter(t => t.is_anomaly).length;

    res.json({
      total_transactions: transactions.length,
      total_spent: totalSpent,
      anomalies_detected: anomalies,
      insights: [
        `You have ${anomalies} unusual transactions detected`,
        `Total spending: ${totalSpent.toFixed(2)} SAR`,
        'Consider reviewing your spending patterns'
      ]
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
