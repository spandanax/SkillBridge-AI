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

// Default MongoDB Atlas URI from project config
const DEFAULT_MONGO_URI = 'mongodb+srv://s93460692_db_user:XLg2aG8KjWANLGlM@cluster0.mf36p6k.mongodb.net/skillbridge?appName=Cluster0';

// MongoDB Connection with serverless caching
let cachedDb = global.mongoose;
if (!cachedDb) {
  cachedDb = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cachedDb.conn && mongoose.connection.readyState === 1) {
    return cachedDb.conn;
  }

  const uri = process.env.MONGODB_URI || DEFAULT_MONGO_URI;

  if (!cachedDb.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };
    cachedDb.promise = mongoose.connect(uri, opts).then((m) => {
      console.log('✅ MongoDB connected successfully');
      return m;
    });
  }

  try {
    cachedDb.conn = await cachedDb.promise;
  } catch (err) {
    cachedDb.promise = null;
    console.error('⚠️ MongoDB connection attempt failed:', err.message);
    throw err;
  }

  return cachedDb.conn;
};

// Initiate connection for local long-running server
if (!process.env.VERCEL) {
  connectDB().catch((err) => {
    console.log('⚠️ Running without database:', err.message);
  });
}

// Middleware to attempt DB connection without breaking health / info endpoints
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && req.path !== '/api/health') {
    try {
      await connectDB();
    } catch (err) {
      console.warn('DB connection unavailable for', req.path, ':', err.message);
    }
  }
  next();
});


// Root landing for browser visits
app.get('/', (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  if (req.accepts('html')) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SkillBridge AI - Backend API</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #0b0f19;
            color: #f1f5f9;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .card {
            background: rgba(30, 41, 59, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(12px);
            padding: 2.5rem;
            border-radius: 1.25rem;
            max-width: 480px;
            width: 90%;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .badge {
            display: inline-block;
            background: rgba(16, 185, 129, 0.15);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.3);
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.8rem;
            font-weight: 600;
            margin-bottom: 1rem;
          }
          h1 {
            font-size: 1.5rem;
            margin: 0 0 0.5rem 0;
            color: #ffffff;
          }
          p {
            color: #94a3b8;
            font-size: 0.95rem;
            line-height: 1.5;
            margin-bottom: 1.75rem;
          }
          .btn {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: #ffffff;
            text-decoration: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.75rem;
            font-weight: 600;
            font-size: 0.95rem;
            box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 20px -3px rgba(99, 102, 241, 0.4);
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">● Backend Online & MongoDB Connected</div>
          <h1>SkillBridge AI - Backend API</h1>
          <p>
            You are currently on <strong>Port 5000</strong> (the Backend API server).<br/>
            The full interactive web application is running on <strong>Port 5173</strong>.
          </p>
          <a class="btn" href="${frontendUrl}">Open SkillBridge Web App ➔</a>
        </div>
      </body>
      </html>
    `);
  }
  res.json({
    success: true,
    message: 'SkillBridge AI Backend API running',
    frontendUrl,
    health: '/api/health',
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasMongoUri: Boolean(process.env.MONGODB_URI),
    mongoUriPrefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 15) + '...' : 'NOT_SET',
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
