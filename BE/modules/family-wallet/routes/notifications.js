const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const getNotificationModel = require('../models/Notification');
const router = express.Router();

// Get all notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { is_read, limit = 50 } = req.query;
    const Notification = await getNotificationModel();
    const query = { user_id: req.user.id };
    
    if (is_read !== undefined) {
      query.is_read = is_read === 'true';
    }

    const notifications = await Notification.find(query)
      .sort({ created_at: -1 })
      .limit(parseInt(limit));

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single notification
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const Notification = await getNotificationModel();
    const notification = await Notification.findOne({
      _id: req.params.id,
      user_id: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ notification });
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create notification
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { family_id, type, title, message } = req.body;

    if (!family_id || !type || !title || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const Notification = await getNotificationModel();
    const notification = new Notification({
      user_id: req.user.id,
      family_id,
      type,
      title,
      message,
      is_read: false
    });

    await notification.save();

    res.status(201).json({ notification });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update notification (mark as read/unread)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { is_read, title, message } = req.body;
    const Notification = await getNotificationModel();
    
    const updateData = {};
    if (is_read !== undefined) updateData.is_read = is_read;
    if (title) updateData.title = title;
    if (message) updateData.message = message;

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      updateData,
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ notification });
  } catch (error) {
    console.error('Update notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark all as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const Notification = await getNotificationModel();
    const result = await Notification.updateMany(
      { user_id: req.user.id, is_read: false },
      { is_read: true }
    );

    res.json({ message: 'All notifications marked as read', count: result.modifiedCount });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const Notification = await getNotificationModel();
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete all notifications
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const Notification = await getNotificationModel();
    const result = await Notification.deleteMany({ user_id: req.user.id });

    res.json({ message: 'All notifications deleted', count: result.deletedCount });
  } catch (error) {
    console.error('Delete all notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
