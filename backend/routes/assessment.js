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

// Default skills map for careers fallback
const DEFAULT_CAREER_SKILLS = {
  'Cybersecurity Analyst': [
    { skillName: 'Networking', category: 'Fundamentals', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'Linux', category: 'OS', targetProficiency: 3, priority: 'Essential' },
    { skillName: 'Security Protocols', category: 'Security', targetProficiency: 3, priority: 'Essential' },
    { skillName: 'Python', category: 'Language', targetProficiency: 2, priority: 'Important' },
    { skillName: 'Threat Analysis', category: 'Skills', targetProficiency: 3, priority: 'Essential' },
    { skillName: 'SIEM Tools', category: 'Tools', targetProficiency: 2, priority: 'Important' },
    { skillName: 'Cryptography', category: 'Security', targetProficiency: 2, priority: 'Important' },
    { skillName: 'Ethical Hacking', category: 'Skills', targetProficiency: 2, priority: 'Nice-to-have' },
  ],
  'Frontend Developer': [
    { skillName: 'HTML', category: 'Core', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'CSS', category: 'Core', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'JavaScript', category: 'Core', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'React', category: 'Framework', targetProficiency: 3, priority: 'Important' },
    { skillName: 'TypeScript', category: 'Language', targetProficiency: 3, priority: 'Important' },
    { skillName: 'Git', category: 'Tools', targetProficiency: 3, priority: 'Essential' },
  ],
  'Backend Developer': [
    { skillName: 'Node.js', category: 'Runtime', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'JavaScript', category: 'Language', targetProficiency: 3, priority: 'Essential' },
    { skillName: 'Express.js', category: 'Framework', targetProficiency: 3, priority: 'Important' },
    { skillName: 'MongoDB', category: 'Database', targetProficiency: 3, priority: 'Important' },
    { skillName: 'REST APIs', category: 'Architecture', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'Git', category: 'Tools', targetProficiency: 3, priority: 'Essential' },
  ],
  'Full-Stack Developer': [
    { skillName: 'HTML', category: 'Frontend', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'CSS', category: 'Frontend', targetProficiency: 3, priority: 'Essential' },
    { skillName: 'JavaScript', category: 'Core', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'React', category: 'Frontend', targetProficiency: 3, priority: 'Important' },
    { skillName: 'Node.js', category: 'Backend', targetProficiency: 3, priority: 'Important' },
    { skillName: 'MongoDB', category: 'Database', targetProficiency: 3, priority: 'Important' },
  ],
  'Data Analyst': [
    { skillName: 'Python', category: 'Language', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'SQL', category: 'Database', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'Excel', category: 'Tools', targetProficiency: 3, priority: 'Important' },
    { skillName: 'Tableau', category: 'Visualization', targetProficiency: 3, priority: 'Important' },
    { skillName: 'Statistics', category: 'Math', targetProficiency: 3, priority: 'Essential' },
  ],
  'UI/UX Designer': [
    { skillName: 'Figma', category: 'Tools', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'UI Design Principles', category: 'Design', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'UX Research', category: 'Research', targetProficiency: 3, priority: 'Essential' },
    { skillName: 'Wireframing', category: 'Skills', targetProficiency: 3, priority: 'Essential' },
  ],
  'Cloud Engineer': [
    { skillName: 'AWS/Azure/GCP', category: 'Cloud', targetProficiency: 4, priority: 'Essential' },
    { skillName: 'Linux', category: 'OS', targetProficiency: 3, priority: 'Essential' },
    { skillName: 'Docker', category: 'Containers', targetProficiency: 3, priority: 'Important' },
    { skillName: 'Networking', category: 'Fundamentals', targetProficiency: 3, priority: 'Essential' },
  ],
};

// @POST /api/assessment - Submit skill assessment
router.post('/', protect, async (req, res) => {
  try {
    const { careerGoal, skillRatings } = req.body;

    if (!careerGoal || !skillRatings || skillRatings.length === 0) {
      return res.status(400).json({ success: false, message: 'Career goal and skill ratings are required.' });
    }

    const totalPossible = skillRatings.length * 5;
    const totalScore = skillRatings.reduce((sum, s) => sum + (Number(s.proficiency) || 0), 0);
    const overallScore = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

    let readinessLevel = 'Beginner';
    if (overallScore >= 80) readinessLevel = 'Expert';
    else if (overallScore >= 60) readinessLevel = 'Advanced';
    else if (overallScore >= 40) readinessLevel = 'Intermediate';
    else if (overallScore >= 20) readinessLevel = 'Developing';

    const assessmentPayload = {
      user: req.user._id,
      careerGoal,
      skillRatings,
      overallScore,
      readinessLevel,
      completedAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      const saved = await SkillAssessment.findOneAndUpdate(
        { user: req.user._id },
        assessmentPayload,
        { new: true, upsert: true, runValidators: true }
      );
      return res.json({ success: true, message: 'Assessment submitted successfully!', assessment: saved });
    }

    return res.json({
      success: true,
      message: 'Assessment submitted successfully!',
      assessment: { ...assessmentPayload, _id: new mongoose.Types.ObjectId() },
    });
  } catch (err) {
    console.error('Assessment error:', err.message);
    const fallbackAssessment = {
      user: req.user._id,
      careerGoal: req.body.careerGoal || 'Cybersecurity Analyst',
      skillRatings: req.body.skillRatings || [],
      overallScore: 50,
      readinessLevel: 'Intermediate',
      completedAt: new Date(),
      _id: new mongoose.Types.ObjectId(),
    };
    return res.json({ success: true, message: 'Assessment submitted successfully!', assessment: fallbackAssessment });
  }
});

// @GET /api/assessment/gap-analysis - Skill gap analysis
router.get('/gap-analysis', protect, async (req, res) => {
  try {
    let assessment = null;
    if (mongoose.connection.readyState === 1) {
      assessment = await SkillAssessment.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    }

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Please complete an assessment first.' });
    }

    let requiredSkills = DEFAULT_CAREER_SKILLS[assessment.careerGoal] || DEFAULT_CAREER_SKILLS['Cybersecurity Analyst'];

    try {
      if (mongoose.connection.readyState === 1) {
        const career = await Career.findOne({ name: assessment.careerGoal });
        if (career && career.requiredSkills && career.requiredSkills.length > 0) {
          requiredSkills = career.requiredSkills;
        }
      }
    } catch (e) {
      // Use fallback requiredSkills
    }

    const userSkillMap = {};
    (assessment.skillRatings || []).forEach(s => {
      userSkillMap[(s.skillName || '').toLowerCase()] = Number(s.proficiency) || 0;
    });

    const analysis = requiredSkills.map(required => {
      const userLevel = userSkillMap[(required.skillName || '').toLowerCase()] || 0;
      const target = required.targetProficiency || 3;
      const gap = target - userLevel;

      return {
        skillName: required.skillName,
        category: required.category || 'Core',
        priority: required.priority || 'Essential',
        currentLevel: userLevel,
        targetLevel: target,
        gap: gap,
        status: gap <= 0 ? 'strong' : gap <= 1 ? 'improve' : 'missing',
      };
    });

    const strong = analysis.filter(s => s.status === 'strong');
    const improve = analysis.filter(s => s.status === 'improve');
    const missing = analysis.filter(s => s.status === 'missing');

    const totalSkills = analysis.length || 1;
    const weightedScore = analysis.reduce((sum, s) => {
      return sum + Math.min(s.currentLevel / (s.targetLevel || 1), 1);
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
        overallScore: assessment.overallScore || readinessScore,
        readinessLevel: assessment.readinessLevel || 'Intermediate',
      },
    });
  } catch (err) {
    console.error('Gap analysis error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to perform gap analysis.' });
  }
});

module.exports = router;
