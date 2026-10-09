const express = require('express');
const Career = require('../models/Career');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @GET /api/careers - Get all careers
router.get('/', async (req, res) => {
  try {
    const careers = await Career.find({ isActive: true }).select('-requiredSkills');
    res.json({ success: true, careers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch careers.' });
  }
});

// @GET /api/careers/:slug - Get career by slug
router.get('/:slug', async (req, res) => {
  try {
    const career = await Career.findOne({ slug: req.params.slug, isActive: true });
    if (!career) {
      return res.status(404).json({ success: false, message: 'Career not found.' });
    }
    res.json({ success: true, career });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch career.' });
  }
});

module.exports = router;
