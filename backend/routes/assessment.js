const express = require('express');
const mongoose = require('mongoose');
const SkillAssessment = require('../models/SkillAssessment');
const Career = require('../models/Career');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @GET /api/assessment - Get user's latest assessment
router.get('/', protect, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const assessment = await SkillAssessment.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      return res.json({ success: true, assessment: assessment || null });
    }
    return res.json({ success: true, assessment: null });
  } catch (err) {
    res.json({ success: true, assessment: null });
  }
});

// @POST /api/assessment - Submit skill assessment
router.post('/', protect, async (req, res) => {
  try {
    const { careerGoal, skillRatings } = req.body;

    if (!careerGoal || !skillRatings || skillRatings.length === 0) {
      return res.status(400).json({ success: false, message: 'Career goal and skill ratings are required.' });
    }

    // Upsert assessment (one per user)
    const assessment = await SkillAssessment.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        careerGoal,
        skillRatings,
        completedAt: new Date(),
      },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );

    // Trigger save hooks by doing a manual save to recalculate score
    const existing = await SkillAssessment.findById(assessment._id);
    existing.skillRatings = skillRatings;
    existing.careerGoal = careerGoal;
    existing.completedAt = new Date();
    await existing.save();

    res.json({ success: true, message: 'Assessment submitted successfully!', assessment: existing });
  } catch (err) {
    console.error('Assessment error:', err);
    res.status(500).json({ success: false, message: 'Failed to save assessment.' });
  }
});

// @GET /api/assessment/gap-analysis - Skill gap analysis
router.get('/gap-analysis', protect, async (req, res) => {
  try {
    const assessment = await SkillAssessment.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Please complete an assessment first.' });
    }

    const career = await Career.findOne({ name: assessment.careerGoal });
    if (!career) {
      return res.status(404).json({ success: false, message: 'Career data not found.' });
    }

    const userSkillMap = {};
    assessment.skillRatings.forEach(s => {
      userSkillMap[s.skillName.toLowerCase()] = s.proficiency;
    });

    const analysis = career.requiredSkills.map(required => {
      const userLevel = userSkillMap[required.skillName.toLowerCase()] || 0;
      const gap = required.targetProficiency - userLevel;

      return {
        skillName: required.skillName,
        category: required.category,
        priority: required.priority,
        currentLevel: userLevel,
        targetLevel: required.targetProficiency,
        gap: gap,
        status: gap <= 0 ? 'strong' : gap <= 1 ? 'improve' : 'missing',
      };
    });

    const strong = analysis.filter(s => s.status === 'strong');
    const improve = analysis.filter(s => s.status === 'improve');
    const missing = analysis.filter(s => s.status === 'missing');

    // Career readiness score (estimate - not a guarantee of employment)
    const totalSkills = analysis.length;
    const weightedScore = analysis.reduce((sum, s) => {
      return sum + Math.min(s.currentLevel / s.targetLevel, 1);
    }, 0);
    const readinessScore = Math.round((weightedScore / totalSkills) * 100);

    res.json({
      success: true,
      gapAnalysis: {
        careerGoal: assessment.careerGoal,
        readinessScore,
        disclaimer: 'This score is an estimate based on self-reported skill ratings and configured career requirements. It is not a guarantee of employment readiness.',
        strong,
        improve,
        missing,
        all: analysis,
        overallScore: assessment.overallScore,
        readinessLevel: assessment.readinessLevel,
      },
    });
  } catch (err) {
    console.error('Gap analysis error:', err);
    res.status(500).json({ success: false, message: 'Failed to perform gap analysis.' });
  }
});

module.exports = router;
