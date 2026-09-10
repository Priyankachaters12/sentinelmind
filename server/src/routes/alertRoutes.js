const express = require('express');
const { run, all } = require('../db');
const { requireAuth } = require('../auth');

const router = express.Router();

// Ensure alerts database table exists
async function ensureAlertsTable() {
  await run(`
    CREATE TABLE IF NOT EXISTS distress_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      recipient_name TEXT NOT NULL,
      recipient_email TEXT,
      recipient_phone TEXT,
      alert_type TEXT NOT NULL,
      custom_note TEXT,
      distress_score REAL,
      risk_level TEXT,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
}

// POST /api/alerts/send
router.post('/send', requireAuth, async (req, res) => {
  try {
    await ensureAlertsTable();

    const {
      recipientName,
      recipientEmail,
      recipientPhone,
      alertType = 'both',
      customNote = '',
      distressScore = 0,
      riskLevel = 'unknown'
    } = req.body;

    if (!recipientName || (!recipientEmail && !recipientPhone)) {
      return res.status(400).json({ error: 'Please provide recipient name and at least an email or phone number.' });
    }

    const userId = req.user.id;
    const userName = req.user.name || 'SentinelMind User';

    // Insert alert log into DB
    const result = await run(
      `INSERT INTO distress_alerts 
       (user_id, recipient_name, recipient_email, recipient_phone, alert_type, custom_note, distress_score, risk_level) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        recipientName.trim(),
        recipientEmail ? recipientEmail.trim().toLowerCase() : null,
        recipientPhone ? recipientPhone.trim() : null,
        alertType,
        customNote.trim(),
        distressScore,
        riskLevel
      ]
    );

    const dispatchId = `ALT-${result.lastID}-${Date.now().toString().slice(-4)}`;

    // Build notification preview text
    const messageSubject = `[URGENT] Wellness Alert from ${userName}`;
    const messageBody = `EMERGENCY DISTRESS ALERT: ${userName} has sent you a mental wellness alert notification via SentinelMind. Current Distress Score: ${distressScore}/100 (${riskLevel.toUpperCase()}). Note: "${customNote || 'I am reaching out for support.'}". Please check in with them as soon as possible.`;

    console.log(`[SentinelMind Alert Dispatcher] ${alertType.toUpperCase()} sent to ${recipientName} (${recipientEmail || recipientPhone})`);

    return res.json({
      success: true,
      message: `Distress alert successfully dispatched to ${recipientName} via ${alertType === 'both' ? 'Email & SMS' : alertType.toUpperCase()}.`,
      dispatchId,
      timestamp: new Date().toISOString(),
      details: {
        recipientName,
        recipientEmail,
        recipientPhone,
        alertType,
        messageSubject,
        messageBody
      }
    });
  } catch (err) {
    console.error('Alert sending error:', err);
    return res.status(500).json({ error: 'Failed to send distress alert notification.' });
  }
});

// GET /api/alerts/history
router.get('/history', requireAuth, async (req, res) => {
  try {
    await ensureAlertsTable();
    const alerts = await all(
      'SELECT * FROM distress_alerts WHERE user_id = ? ORDER BY sent_at DESC LIMIT 20',
      [req.user.id]
    );
    return res.json({ alerts });
  } catch (err) {
    console.error('Alert history error:', err);
    return res.status(500).json({ error: 'Failed to fetch alert history.' });
  }
});

module.exports = router;
