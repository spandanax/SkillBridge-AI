const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  careerGoals: [{ type: String }],
  skillsRequired: [{ type: String }],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true,
  },
  techStack: [{ type: String }],
  implementationSteps: [{ type: String }],
  expectedOutcome: { type: String },
  estimatedHours: { type: Number, default: 20 },
  githubTemplate: { type: String },
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Project', projectSchema);
