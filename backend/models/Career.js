const mongoose = require('mongoose');

const careerSkillSchema = new mongoose.Schema({
  skillName: { type: String, required: true },
  category: { type: String },
  targetProficiency: { type: Number, min: 0, max: 5, default: 3 },
  priority: {
    type: String,
    enum: ['Essential', 'Important', 'Nice-to-have'],
    default: 'Important',
  },
}, { _id: false });

const careerSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  icon: { type: String, default: '💼' },
  averageSalary: { type: String },
  demandLevel: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  requiredSkills: [careerSkillSchema],
  responsibilities: [{ type: String }],
  sampleProjects: [{ type: String }],
  learningPath: [{ type: String }],
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Career', careerSchema);
