const mongoose = require('mongoose');

const skillRatingSchema = new mongoose.Schema({
  skillName: { type: String, required: true },
  proficiency: { type: Number, min: 0, max: 5, default: 0 }, // 0-5 scale
  category: { type: String },
}, { _id: false });

const skillAssessmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  careerGoal: {
    type: String,
    required: true,
  },
  skillRatings: [skillRatingSchema],
  overallScore: { type: Number, min: 0, max: 100, default: 0 },
  readinessLevel: {
    type: String,
    enum: ['Beginner', 'Developing', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner',
  },
  completedAt: { type: Date },
  notes: { type: String, maxlength: 1000 },
}, {
  timestamps: true,
});

// Calculate overall score before save
skillAssessmentSchema.pre('save', function () {
  if (this.skillRatings && this.skillRatings.length > 0) {
    const totalPossible = this.skillRatings.length * 5;
    const totalScore = this.skillRatings.reduce((sum, s) => sum + s.proficiency, 0);
    this.overallScore = Math.round((totalScore / totalPossible) * 100);

    if (this.overallScore >= 80) this.readinessLevel = 'Expert';
    else if (this.overallScore >= 60) this.readinessLevel = 'Advanced';
    else if (this.overallScore >= 40) this.readinessLevel = 'Intermediate';
    else if (this.overallScore >= 20) this.readinessLevel = 'Developing';
    else this.readinessLevel = 'Beginner';
  }
});

module.exports = mongoose.model('SkillAssessment', skillAssessmentSchema);
