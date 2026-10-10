const express = require('express');
const mongoose = require('mongoose');
const LearningRoadmap = require('../models/LearningRoadmap');
const SkillAssessment = require('../models/SkillAssessment');
const Career = require('../models/Career');
const LearningResource = require('../models/LearningResource');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper: Generate roadmap items from gap analysis
const generateRoadmapItems = (gapSkills, resources) => {
  return gapSkills.map((skill, index) => {
    const relatedResource = resources.find(r =>
      r.skills.some(s => s.toLowerCase().includes(skill.skillName.toLowerCase()))
    );

    return {
      skillName: skill.skillName,
      learningObjective: `Achieve ${skill.targetLevel}/5 proficiency in ${skill.skillName}`,
      recommendedResource: relatedResource ? relatedResource.title : `Search for ${skill.skillName} tutorials`,
      resourceUrl: relatedResource ? relatedResource.url : 'https://www.youtube.com',
      estimatedHours: skill.status === 'missing' ? 20 : 10,
      difficulty: skill.targetLevel >= 4 ? 'Advanced' : skill.targetLevel >= 3 ? 'Intermediate' : 'Beginner',
      priority: skill.priority === 'Essential' ? 'High' : skill.priority === 'Important' ? 'Medium' : 'Low',
      status: 'pending',
      order: index,
    };
  });
};

// @GET /api/roadmap - Get user's roadmap
router.get('/', protect, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const roadmap = await LearningRoadmap.findOne({ user: req.user._id });
      return res.json({ success: true, roadmap: roadmap || null });
    }
    return res.json({ success: true, roadmap: null });
  } catch (err) {
    res.json({ success: true, roadmap: null });
  }
});

// Default skills map for careers fallback
const DEFAULT_CAREER_SKILLS = {
  'Cybersecurity Analyst': [
    { skillName: 'Networking', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'Linux', targetProficiency: 3, priority: 'Essential' },
    { skillName: 'Security Protocols', targetProficiency: 3, priority: 'Essential' },
    { skillName: 'Python', targetProficiency: 2, priority: 'Important' },
    { skillName: 'Threat Analysis', targetProficiency: 3, priority: 'Essential' },
    { skillName: 'SIEM Tools', targetProficiency: 2, priority: 'Important' },
    { skillName: 'Cryptography', targetProficiency: 2, priority: 'Important' },
    { skillName: 'Ethical Hacking', targetProficiency: 2, priority: 'Nice-to-have' },
  ],
  'Frontend Developer': [
    { skillName: 'HTML', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'CSS', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'JavaScript', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'React', targetProficiency: 3, priority: 'Important' },
    { skillName: 'TypeScript', targetProficiency: 3, priority: 'Important' },
    { skillName: 'Git', targetProficiency: 3, priority: 'Essential' },
  ],
  'Backend Developer': [
    { skillName: 'Node.js', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'JavaScript', targetProficiency: 3, priority: 'Essential' },
    { skillName: 'Express.js', targetProficiency: 3, priority: 'Important' },
    { skillName: 'MongoDB', targetProficiency: 3, priority: 'Important' },
    { skillName: 'REST APIs', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'Git', targetProficiency: 3, priority: 'Essential' },
  ],
  'Full-Stack Developer': [
    { skillName: 'HTML', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'CSS', targetProficiency: 3, priority: 'Essential' },
    { skillName: 'JavaScript', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'React', targetProficiency: 3, priority: 'Important' },
    { skillName: 'Node.js', targetProficiency: 3, priority: 'Important' },
    { skillName: 'MongoDB', targetProficiency: 3, priority: 'Important' },
  ],
  'Data Analyst': [
    { skillName: 'Python', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'SQL', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'Excel', targetProficiency: 3, priority: 'Important' },
    { skillName: 'Tableau', targetProficiency: 3, priority: 'Important' },
    { skillName: 'Statistics', targetProficiency: 3, priority: 'Essential' },
  ],
  'UI/UX Designer': [
    { skillName: 'Figma', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'UI Design Principles', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'UX Research', targetProficiency: 3, priority: 'Essential' },
    { skillName: 'Wireframing', targetProficiency: 3, priority: 'Essential' },
  ],
  'Cloud Engineer': [
    { skillName: 'AWS/Azure/GCP', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'Linux', targetProficiency: 3, priority: 'Essential' },
    { skillName: 'Docker', targetProficiency: 3, priority: 'Important' },
    { skillName: 'Networking', targetProficiency: 3, priority: 'Essential' },
  ],
};

// @POST /api/roadmap/generate - Auto-generate from assessment
router.post('/generate', protect, async (req, res) => {
  try {
    let assessment = null;
    if (mongoose.connection.readyState === 1) {
      try {
        assessment = await SkillAssessment.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      } catch (e) {}
    }

    let careerGoal = assessment?.careerGoal;
    if (!careerGoal) {
      try {
        const StudentProfile = require('../models/StudentProfile');
        if (mongoose.connection.readyState === 1) {
          const profile = await StudentProfile.findOne({ user: req.user._id });
          if (profile?.preferredCareer) careerGoal = profile.preferredCareer;
        }
      } catch (e) {}
    }

    if (!careerGoal) {
      careerGoal = 'Cybersecurity Analyst';
    }

    let requiredSkills = DEFAULT_CAREER_SKILLS[careerGoal] || DEFAULT_CAREER_SKILLS['Cybersecurity Analyst'];
    let resources = [];

    try {
      if (mongoose.connection.readyState === 1) {
        const career = await Career.findOne({ name: careerGoal });
        if (career && career.requiredSkills && career.requiredSkills.length > 0) {
          requiredSkills = career.requiredSkills;
        }
        resources = await LearningResource.find({
          careerGoals: { $in: [careerGoal] },
          isActive: true,
        });
      }
    } catch (e) {}

    // Build gap list
    const userSkillMap = {};
    (assessment?.skillRatings || []).forEach(s => {
      userSkillMap[(s.skillName || '').toLowerCase()] = Number(s.proficiency) || 0;
    });

    const gapSkills = [];
    requiredSkills.forEach(required => {
      const userLevel = userSkillMap[(required.skillName || '').toLowerCase()] || 0;
      const target = required.targetProficiency || 3;
      if (userLevel < target) {
        gapSkills.push({
          skillName: required.skillName,
          currentLevel: userLevel,
          targetLevel: target,
          priority: required.priority || 'Important',
          status: userLevel === 0 ? 'missing' : 'improve',
        });
      }
    });

    const items = generateRoadmapItems(gapSkills.length > 0 ? gapSkills : requiredSkills.map(r => ({ skillName: r.skillName, currentLevel: 0, targetLevel: r.targetProficiency || 3, priority: r.priority || 'Important', status: 'missing' })), resources);

    const roadmapData = {
      user: req.user._id,
      careerGoal,
      items,
      progressPercentage: 0,
      generatedAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const roadmap = await LearningRoadmap.findOneAndUpdate(
          { user: req.user._id },
          roadmapData,
          { new: true, upsert: true }
        );
        return res.json({ success: true, message: 'Roadmap generated successfully!', roadmap });
      } catch (e) {}
    }

    return res.json({
      success: true,
      message: 'Roadmap generated successfully!',
      roadmap: { ...roadmapData, _id: new mongoose.Types.ObjectId() },
    });
  } catch (err) {
    console.error('Roadmap generate error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to generate roadmap.' });
  }
});

// @PATCH /api/roadmap/item/:itemId - Update item status
router.patch('/item/:itemId', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const roadmap = await LearningRoadmap.findOne({ user: req.user._id });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found.' });
    }

    const item = roadmap.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    item.status = status;
    if (status === 'completed') item.completedAt = new Date();

    await roadmap.save();

    res.json({ success: true, message: 'Item updated!', roadmap });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update roadmap item.' });
  }
});

// @POST /api/roadmap - Save manual roadmap
router.post('/', protect, async (req, res) => {
  try {
    const { careerGoal, items } = req.body;
    const roadmap = await LearningRoadmap.findOneAndUpdate(
      { user: req.user._id },
      { user: req.user._id, careerGoal, items },
      { new: true, upsert: true }
    );
    await roadmap.save();
    res.json({ success: true, roadmap });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save roadmap.' });
  }
});

module.exports = router;
