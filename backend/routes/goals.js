const express = require('express');
const mongoose = require('mongoose');
const { LearningGoal, Notification } = require('../models/Goals');
const { protect } = require('../middleware/auth');

const router = express.Router();

// === LEARNING GOALS ===

// @GET /api/goals - Get user's goals
router.get('/', protect, async (req, res) => {
  try {
    const goals = await LearningGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, goals });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch goals.' });
  }
});

// @POST /api/goals - Create new goal
router.post('/', protect, async (req, res) => {
  try {
    const goal = await LearningGoal.create({ ...req.body, user: req.user._id });

    // Create notification for the new goal
    await Notification.create({
      user: req.user._id,
      title: 'New Goal Set! 🎯',
      message: `You've set a new goal: "${goal.title}"`,
      type: 'success',
    });

    res.status(201).json({ success: true, message: 'Goal created!', goal });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create goal.' });
  }
});

// @PATCH /api/goals/:id - Update goal
router.patch('/:id', protect, async (req, res) => {
  try {
    const goal = await LearningGoal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });

    if (goal.status === 'completed') {
      await Notification.create({
        user: req.user._id,
        title: 'Goal Completed! 🏆',
        message: `Congratulations! You completed: "${goal.title}"`,
        type: 'achievement',
        icon: '🏆',
      });
    }

    res.json({ success: true, message: 'Goal updated!', goal });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update goal.' });
  }
});

// @DELETE /api/goals/:id - Delete goal
router.delete('/:id', protect, async (req, res) => {
  try {
    await LearningGoal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Goal deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete goal.' });
  }
});

// === NOTIFICATIONS ===

// @GET /api/goals/notifications - Get user's notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
});

// @PATCH /api/goals/notifications/read-all - Mark all as read
router.patch('/notifications/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
});

module.exports = router;
