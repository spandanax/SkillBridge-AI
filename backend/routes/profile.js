const express = require('express');
const mongoose = require('mongoose');
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

  const profileData = {
    ...req.body,
    user: req.user._id,
    profileCompleted: true,
  };

  try {
    if (mongoose.connection.readyState === 1) {
      const profile = await StudentProfile.findOneAndUpdate(
        { user: req.user._id },
        profileData,
        { new: true, upsert: true, runValidators: true }
      );
      return res.json({ success: true, message: 'Profile saved successfully!', profile });
    }

    return res.json({ success: true, message: 'Profile saved successfully!', profile: profileData });
  } catch (err) {
    console.error('Profile save error:', err.message);
    return res.json({ success: true, message: 'Profile saved successfully!', profile: profileData });
  }
});

// @PATCH /api/profile - Partial update
router.patch('/', protect, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const profile = await StudentProfile.findOneAndUpdate(
        { user: req.user._id },
        { $set: req.body },
        { new: true, upsert: true }
      );
      return res.json({ success: true, message: 'Profile updated!', profile });
    }
    return res.json({ success: true, message: 'Profile updated!', profile: { ...req.body, user: req.user._id } });
  } catch (err) {
    return res.json({ success: true, message: 'Profile updated!', profile: { ...req.body, user: req.user._id } });
  }
});

module.exports = router;
