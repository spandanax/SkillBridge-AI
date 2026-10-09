const mongoose = require('mongoose');

const learningResourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  url: { type: String, required: true },
  provider: { type: String },
  skillCategory: { type: String, required: true },
  skills: [{ type: String }],
  resourceType: {
    type: String,
    enum: ['Course', 'Tutorial', 'Documentation', 'Book', 'Video', 'Practice', 'Project'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true,
  },
  isFree: { type: Boolean, default: true },
  estimatedHours: { type: Number },
  rating: { type: Number, min: 0, max: 5 },
  careerGoals: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('LearningResource', learningResourceSchema);
