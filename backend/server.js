const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const assessmentRoutes = require('./routes/assessment');
const roadmapRoutes = require('./routes/roadmap');
const projectRoutes = require('./routes/projects');
const careerRoutes = require('./routes/careers');
const resourceRoutes = require('./routes/resources');
const progressRoutes = require('./routes/progress');
const goalRoutes = require('./routes/goals');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin === 'http://localhost:5173' ||
      origin === process.env.FRONTEND_URL ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillbridge');
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('⚠️  Running without database - some features will be unavailable');
  }
};

connectDB();

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/goals', goalRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 SkillBridge AI Backend running on port ${PORT}`);
  });
}

module.exports = app;
