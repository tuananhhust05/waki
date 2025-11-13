const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const getBudgetModel = require('../models/Budget');
const getFamilyModel = require('../models/Family');
const getFamilyMemberModel = require('../models/FamilyMember');
const mongoose = require('mongoose');
const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { user_id, amount, period, start_date, end_date } = req.body;
    const parentId = req.user.id;

    const Family = await getFamilyModel();
    const FamilyMember = await getFamilyMemberModel();
    const Budget = await getBudgetModel();

    const family = await Family.findOne({ parent_id: parentId });
    if (!family) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const userId = mongoose.isValidObjectId(user_id) ? new mongoose.Types.ObjectId(user_id) : user_id;
    const isMember = await FamilyMember.findOne({
      family_id: family._id,
      user_id: userId
    });

    if (!isMember) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const budget = new Budget({
      family_id: family._id,
      user_id: userId,
      amount: parseFloat(amount),
      period,
      start_date: new Date(start_date),
      end_date: end_date ? new Date(end_date) : null
    });
    await budget.save();

    res.status(201).json({ budget });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const Budget = await getBudgetModel();
    const mongoose = require('mongoose');
    const userId = mongoose.isValidObjectId(req.params.userId) ? new mongoose.Types.ObjectId(req.params.userId) : req.params.userId;
    const budgets = await Budget.find({
      user_id: userId,
      is_active: true
    }).sort({ created_at: -1 });

    res.json({ budgets });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
