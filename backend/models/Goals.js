const mongoose = require('mongoose');

const learningGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  targetHoursPerWeek: { type: Number, default: 5, min: 0 },
  deadline: { type: Date },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active',
  },
  completedAt: { type: Date },
  reminderEnabled: { type: Boolean, default: true },
  reminderDays: [{ type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }],
  category: { type: String },
  currentProgress: { type: Number, default: 0, min: 0, max: 100 },
}, {
  timestamps: true,
});

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'achievement', 'reminder'],
    default: 'info',
  },
  isRead: { type: Boolean, default: false },
  actionUrl: { type: String },
  icon: { type: String },
}, {
  timestamps: true,
});

const LearningGoal = mongoose.model('LearningGoal', learningGoalSchema);
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { LearningGoal, Notification };
