const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'skillbridge_dev_secret_key_2024';

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please log in.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    let user = null;
    try {
      if (mongoose.connection.readyState === 1) {
        user = await User.findById(decoded.id);
      }
    } catch (e) {
      // Fallback below
    }

    if (!user) {
      user = { _id: decoded.id, id: decoded.id, name: 'Student', email: 'student@skillbridge.ai' };
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = { protect, generateToken };
