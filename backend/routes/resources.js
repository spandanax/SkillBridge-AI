const express = require('express');
const mongoose = require('mongoose');
const LearningResource = require('../models/LearningResource');

const router = express.Router();

// @GET /api/resources - Searchable, filterable resource library
router.get('/', async (req, res) => {
  try {

    const { search, type, difficulty, career, skill, free } = req.query;
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (type) query.resourceType = type;
    if (difficulty) query.difficulty = difficulty;
    if (career) query.careerGoals = { $in: [career] };
    if (skill) query.skills = { $in: [new RegExp(skill, 'i')] };
    if (free === 'true') query.isFree = true;

    let resources = await LearningResource.find(query).sort({ rating: -1 });

    // Fallback: If no resources found for specific career/skill, show all resources
    if (resources.length === 0 && (career || skill)) {
      const fallbackQuery = { isActive: true };
      if (type) fallbackQuery.resourceType = type;
      if (difficulty) fallbackQuery.difficulty = difficulty;
      if (free === 'true') fallbackQuery.isFree = true;
      resources = await LearningResource.find(fallbackQuery).sort({ rating: -1 });
    }

    res.json({ success: true, resources, total: resources.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch resources.' });
  }
});

// @GET /api/resources/:id
router.get('/:id', async (req, res) => {
  try {
    const resource = await LearningResource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' });
    res.json({ success: true, resource });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch resource.' });
  }
});

module.exports = router;
