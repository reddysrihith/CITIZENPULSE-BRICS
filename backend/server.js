const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Log Requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', apiRoutes);

// Health check root
app.get('/', (req, res) => {
  res.json({
    name: 'CitizenPulse BRICS API Server',
    description: 'GovTech / Digital Public Infrastructure Intelligence Backend',
    status: 'Running',
    demoMode: !process.env.GEMINI_API_KEY,
    documentation: '/api/health'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 CitizenPulse BRICS Server listening on port ${PORT}`);
  console.log(`🤖 AI Engine Mode: ${process.env.GEMINI_API_KEY ? 'Gemini 1.5 Flash' : 'DEMO MODE (Deterministic Fallback)'}`);
  console.log(`=======================================================`);
});
