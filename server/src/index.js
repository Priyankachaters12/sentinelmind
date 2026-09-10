const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initDB } = require('./db');
const authRoutes = require('./routes/authRoutes');
const checkinRoutes = require('./routes/checkinRoutes');
const journalRoutes = require('./routes/journalRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const alertRoutes = require('./routes/alertRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/alerts', alertRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'SentinelMind Core Express Backend',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build if dist exists
const distPath = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log('[SentinelMind Server] Serving React UI directly from', distPath);
}

// Bootstrapping
async function startServer() {
  try {
    await initDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[SentinelMind Server] Fullstack app listening on http://localhost:${PORT} and http://127.0.0.1:${PORT}`);
    });
  } catch (err) {
    console.error('[SentinelMind Server] Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
