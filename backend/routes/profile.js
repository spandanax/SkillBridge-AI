const express = require('express');
const { body, validationResult } = require('express-validator');
const StudentProfile = require('../models/StudentProfile');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @GET /api/profile - Get current user's profile
router.get('/', protect, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const profile = await StudentProfile.findOne({ user: req.user._id });
      return res.json({ success: true, profile: profile || null });
    }
    return res.json({ success: true, profile: null });
  } catch (err) {
    res.json({ success: true, profile: null });
  }
});

// @POST /api/profile - Create or update profile
router.post('/', protect, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('educationLevel').notEmpty().withMessage('Education level is required'),
  body('preferredCareer').notEmpty().withMessage('Preferred career is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  try {
    const profileData = {
      ...req.body,
      user: req.user._id,
      profileCompleted: true,
    };

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      profileData,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, message: 'Profile saved successfully!', profile });
  } catch (err) {
    console.error('Profile save error:', err);
    res.status(500).json({ success: false, message: 'Failed to save profile.' });
  }
});

// @PATCH /api/profile - Partial update
router.patch('/', protect, async (req, res) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, message: 'Profile updated!', profile });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

module.exports = router;
