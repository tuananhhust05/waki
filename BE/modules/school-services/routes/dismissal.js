const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const getDismissalCallModel = require('../models/DismissalCall');
const mongoose = require('mongoose');
const router = express.Router();

router.post('/call', authenticateToken, async (req, res) => {
  try {
    const { student_id, school_id, notes } = req.body;
    const DismissalCall = await getDismissalCallModel();
    const call = new DismissalCall({
      student_id: mongoose.isValidObjectId(student_id) ? new mongoose.Types.ObjectId(student_id) : student_id,
      parent_id: req.user.id,
      school_id: mongoose.isValidObjectId(school_id) ? new mongoose.Types.ObjectId(school_id) : school_id,
      notes: notes || null
    });
    await call.save();
    res.status(201).json({ call });
  } catch (error) {
    console.error('Create dismissal call error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/my-calls', authenticateToken, async (req, res) => {
  try {
    const DismissalCall = await getDismissalCallModel();
    const calls = await DismissalCall.find({ parent_id: req.user.id })
      .populate('student_id', 'full_name')
      .populate('school_id', 'name')
      .sort({ call_time: -1 });

    res.json({
      calls: calls.map(c => ({
        id: c._id,
        student_name: c.student_id?.full_name,
        school_name: c.school_id?.name,
        status: c.status,
        call_time: c.call_time
      }))
    });
  } catch (error) {
    console.error('Get dismissal calls error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
