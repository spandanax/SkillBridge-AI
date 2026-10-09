const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: { type: String, trim: true },
  educationLevel: {
    type: String,
    enum: ['High School', 'Diploma', 'Undergraduate', 'Graduate', 'Postgraduate', 'Self-taught'],
  },
  degree: { type: String, trim: true },
  branch: { type: String, trim: true },
  currentSkills: [{ type: String, trim: true }],
  interests: [{ type: String, trim: true }],
  preferredCareer: { type: String, trim: true },
  experienceLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  weeklyLearningHours: {
    type: Number,
    min: 0,
    max: 168,
    default: 5,
  },
  linkedinUrl: { type: String, trim: true },
  githubUrl: { type: String, trim: true },
  portfolioUrl: { type: String, trim: true },
  bio: { type: String, maxlength: 500 },
  profileCompleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
