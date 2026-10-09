const mongoose = require('mongoose');

const roadmapItemSchema = new mongoose.Schema({
  skillName: { type: String, required: true },
  learningObjective: { type: String, required: true },
  recommendedResource: { type: String },
  resourceUrl: { type: String },
  estimatedHours: { type: Number, default: 10 },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending',
  },
  completedAt: { type: Date },
  order: { type: Number, default: 0 },
}, { _id: true });

const learningRoadmapSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  careerGoal: { type: String, required: true },
  items: [roadmapItemSchema],
  totalHours: { type: Number, default: 0 },
  completedHours: { type: Number, default: 0 },
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  generatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// Update progress percentage before save
learningRoadmapSchema.pre('save', function () {
  if (this.items && this.items.length > 0) {
    const completed = this.items.filter(i => i.status === 'completed').length;
    this.progressPercentage = Math.round((completed / this.items.length) * 100);
    this.totalHours = this.items.reduce((sum, i) => sum + (i.estimatedHours || 0), 0);
    this.completedHours = this.items
      .filter(i => i.status === 'completed')
      .reduce((sum, i) => sum + (i.estimatedHours || 0), 0);
  }
});

module.exports = mongoose.model('LearningRoadmap', learningRoadmapSchema);
