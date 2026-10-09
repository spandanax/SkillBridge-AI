const express = require('express');
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
    const roadmap = await LearningRoadmap.findOne({ user: req.user._id });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'No roadmap found. Generate one from your assessment.' });
    }
    res.json({ success: true, roadmap });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch roadmap.' });
  }
});

// @POST /api/roadmap/generate - Auto-generate from assessment
router.post('/generate', protect, async (req, res) => {
  try {
    const assessment = await SkillAssessment.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Please complete a skill assessment first.' });
    }

    const career = await Career.findOne({ name: assessment.careerGoal });
    const resources = await LearningResource.find({
      careerGoals: { $in: [assessment.careerGoal] },
      isActive: true,
    });

    // Build gap list
    const userSkillMap = {};
    assessment.skillRatings.forEach(s => {
      userSkillMap[s.skillName.toLowerCase()] = s.proficiency;
    });

    const gapSkills = [];
    if (career) {
      career.requiredSkills.forEach(required => {
        const userLevel = userSkillMap[required.skillName.toLowerCase()] || 0;
        if (userLevel < required.targetProficiency) {
          gapSkills.push({
            skillName: required.skillName,
            currentLevel: userLevel,
            targetLevel: required.targetProficiency,
            priority: required.priority,
            status: userLevel === 0 ? 'missing' : 'improve',
          });
        }
      });
    }

    const items = generateRoadmapItems(gapSkills, resources);

    const roadmap = await LearningRoadmap.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        careerGoal: assessment.careerGoal,
        items,
        generatedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    await roadmap.save(); // trigger pre-save hooks

    res.json({ success: true, message: 'Roadmap generated successfully!', roadmap });
  } catch (err) {
    console.error('Roadmap generate error:', err);
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
