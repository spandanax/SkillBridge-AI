const path = require('path');

// Load environment variables from backend/.env for local dev
// On Vercel, env vars are set in the dashboard instead
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const app = require('../backend/server');

module.exports = app;
