const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  hoursLearned: { type: Number, default: 0, min: 0 },
  activitiesCompleted: { type: Number, default: 0 },
  notes: { type: String },
}, { _id: false });

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  savedProjects: [{
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    status: {
      type: String,
      enum: ['saved', 'in-progress', 'completed'],
      default: 'saved',
    },
    savedAt: { type: Date, default: Date.now },
    startedAt: { type: Date },
    completedAt: { type: Date },
    githubUrl: { type: String, trim: true },
    liveDemoUrl: { type: String, trim: true },
    submissionNotes: { type: String, trim: true },
    verified: { type: Boolean, default: false },
  }],
  weeklyActivity: [activitySchema],
  totalHoursLearned: { type: Number, default: 0 },
  streakDays: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  achievements: [{
    title: { type: String },
    description: { type: String },
    earnedAt: { type: Date, default: Date.now },
    icon: { type: String, default: '🏆' },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Progress', progressSchema);
