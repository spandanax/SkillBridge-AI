const express = require('express');
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Progress = require('../models/Progress');
const SkillAssessment = require('../models/SkillAssessment');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @GET /api/projects - Get recommended projects for user
router.get('/', protect, async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: true, projects: [], careerGoal: null });
    }

    const { difficulty, career } = req.query;

    // Get user's career goal from assessment
    const assessment = await SkillAssessment.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    const careerGoal = career || (assessment ? assessment.careerGoal : null);

    let query = { isActive: true };
    if (difficulty) query.difficulty = difficulty;
    if (careerGoal) query.careerGoals = { $in: [careerGoal] };

    let projects = await Project.find(query).sort({ difficulty: 1 });

    // Fallback: If no projects found for specific career, show all projects
    if (projects.length === 0 && careerGoal) {
      const fallbackQuery = { isActive: true };
      if (difficulty) fallbackQuery.difficulty = difficulty;
      projects = await Project.find(fallbackQuery).sort({ difficulty: 1 });
    }

    // Get user's saved projects
    const progress = await Progress.findOne({ user: req.user._id });
    const savedIds = progress ? progress.savedProjects.map(p => p.project?.toString()) : [];

    const projectsWithStatus = projects.map(p => {
      const sp = progress?.savedProjects.find(item => item.project?.toString() === p._id.toString());
      return {
        ...p.toObject(),
        savedStatus: sp?.status || null,
        submission: sp ? {
          githubUrl: sp.githubUrl || '',
          liveDemoUrl: sp.liveDemoUrl || '',
          submissionNotes: sp.submissionNotes || '',
          completedAt: sp.completedAt,
          verified: Boolean(sp.verified || sp.githubUrl || sp.liveDemoUrl),
        } : null,
      };
    });

    res.json({ success: true, projects: projectsWithStatus, careerGoal });
  } catch (err) {
    console.error('Projects fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch projects.' });
  }
});

// @GET /api/projects/all - Get all projects (public)
router.get('/all', async (req, res) => {
  try {
    const { difficulty, career, search } = req.query;
    let query = { isActive: true };
    if (difficulty) query.difficulty = difficulty;
    if (career) query.careerGoals = { $in: [career] };
    if (search) query.title = { $regex: search, $options: 'i' };

    const projects = await Project.find(query);
    res.json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch projects.' });
  }
});

// @POST /api/projects/:id/save - Save/update project status & submission proof
router.post('/:id/save', protect, async (req, res) => {
  try {
    const { status = 'saved', githubUrl, liveDemoUrl, submissionNotes } = req.body;
    const projectId = req.params.id;

    let progress = await Progress.findOne({ user: req.user._id });
    if (!progress) {
      progress = new Progress({ user: req.user._id, savedProjects: [] });
    }

    const existing = progress.savedProjects.find(p => p.project?.toString() === projectId);
    const isVerified = Boolean((githubUrl && githubUrl.trim()) || (liveDemoUrl && liveDemoUrl.trim()));

    if (existing) {
      existing.status = status;
      if (status === 'in-progress' && !existing.startedAt) existing.startedAt = new Date();
      if (status === 'completed') {
        existing.completedAt = new Date();
        if (githubUrl !== undefined) existing.githubUrl = githubUrl.trim();
        if (liveDemoUrl !== undefined) existing.liveDemoUrl = liveDemoUrl.trim();
        if (submissionNotes !== undefined) existing.submissionNotes = submissionNotes.trim();
        existing.verified = isVerified;
      }
    } else {
      progress.savedProjects.push({
        project: projectId,
        status,
        savedAt: new Date(),
        startedAt: status === 'in-progress' || status === 'completed' ? new Date() : undefined,
        completedAt: status === 'completed' ? new Date() : undefined,
        githubUrl: githubUrl ? githubUrl.trim() : '',
        liveDemoUrl: liveDemoUrl ? liveDemoUrl.trim() : '',
        submissionNotes: submissionNotes ? submissionNotes.trim() : '',
        verified: status === 'completed' && isVerified,
      });
    }

    // Award portfolio achievement when verified
    if (status === 'completed' && isVerified) {
      const projectDoc = await Project.findById(projectId);
      const title = projectDoc ? projectDoc.title : 'Project';
      const badgeTitle = `Portfolio Ready: ${title}`;
      const alreadyEarned = progress.achievements.some(a => a.title === badgeTitle);
      if (!alreadyEarned) {
        progress.achievements.push({
          title: badgeTitle,
          description: `Built and submitted verified proof for ${title}.`,
          earnedAt: new Date(),
          icon: '🛡️',
        });
      }
    }

    await progress.save();
    res.json({ 
      success: true, 
      message: status === 'completed' 
        ? (isVerified ? 'Project verified & submitted! 🛡️' : 'Project marked complete!') 
        : 'Project status updated!', 
      progress 
    });
  } catch (err) {
    console.error('Project save error:', err);
    res.status(500).json({ success: false, message: 'Failed to save project.' });
  }
});

module.exports = router;
