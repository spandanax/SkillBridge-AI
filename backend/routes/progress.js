const express = require('express');
const mongoose = require('mongoose');
const Progress = require('../models/Progress');
const SkillAssessment = require('../models/SkillAssessment');
const LearningRoadmap = require('../models/LearningRoadmap');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @GET /api/progress - Full dashboard data
router.get('/', protect, async (req, res) => {
  try {


    const [progress, assessment, roadmap] = await Promise.all([
      Progress.findOne({ user: req.user._id }).populate('savedProjects.project'),
      SkillAssessment.findOne({ user: req.user._id }).sort({ createdAt: -1 }),
      LearningRoadmap.findOne({ user: req.user._id }),
    ]);

    const roadmapCompleted = roadmap ? roadmap.items.filter(i => i.status === 'completed').length : 0;
    const roadmapTotal = roadmap ? roadmap.items.length : 0;
    const projectsInProgress = progress ? progress.savedProjects.filter(p => p.status === 'in-progress').length : 0;
    const projectsCompleted = progress ? progress.savedProjects.filter(p => p.status === 'completed').length : 0;

    res.json({
      success: true,
      dashboard: {
        careerGoal: assessment?.careerGoal || null,
        assessmentScore: assessment?.overallScore || 0,
        readinessLevel: assessment?.readinessLevel || 'Not assessed',
        skillsAssessed: assessment?.skillRatings?.length || 0,
        roadmapProgress: {
          completed: roadmapCompleted,
          total: roadmapTotal,
          percentage: roadmap?.progressPercentage || 0,
        },
        projects: {
          saved: progress?.savedProjects.length || 0,
          inProgress: projectsInProgress,
          completed: projectsCompleted,
        },
        totalHoursLearned: progress?.totalHoursLearned || 0,
        streakDays: progress?.streakDays || 0,
        weeklyActivity: progress?.weeklyActivity?.slice(-7) || [],
        achievements: progress?.achievements || [],
      },
    });
  } catch (err) {
    console.error('Progress fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch progress data.' });
  }
});

// @POST /api/progress/activity - Log daily activity
router.post('/activity', protect, async (req, res) => {
  try {
    const { hoursLearned, notes } = req.body;
    let progress = await Progress.findOne({ user: req.user._id });
    if (!progress) {
      progress = new Progress({ user: req.user._id });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEntry = progress.weeklyActivity.find(a => {
      const d = new Date(a.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    if (todayEntry) {
      todayEntry.hoursLearned += hoursLearned || 0;
      todayEntry.activitiesCompleted += 1;
    } else {
      progress.weeklyActivity.push({
        date: today,
        hoursLearned: hoursLearned || 0,
        activitiesCompleted: 1,
        notes,
      });
    }

    progress.totalHoursLearned += hoursLearned || 0;
    progress.lastActiveDate = new Date();

    // Keep only last 30 days of activity
    if (progress.weeklyActivity.length > 30) {
      progress.weeklyActivity = progress.weeklyActivity.slice(-30);
    }

    await progress.save();
    res.json({ success: true, message: 'Activity logged!', progress });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to log activity.' });
  }
});

module.exports = router;
