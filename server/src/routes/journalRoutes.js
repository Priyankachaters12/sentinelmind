const express = require('express');
const { run, all } = require('../db');
const { requireAuth } = require('../auth');
const { analyzeJournal, predictDistress } = require('../services/aiClient');
const { engineerFeaturesForUser } = require('../services/featureEngineer');
const { generateRecommendations } = require('../services/recommendationEngine');

const router = express.Router();

// Submit journal entry
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Journal text cannot be empty.' });
    }

    // Step 3: NLP pipeline analysis
    const nlpResult = await analyzeJournal(text.trim());

    const result = await run(
      'INSERT INTO journals (user_id, text, sentiment, intensity, dominant_emotion, emotions_json, flags_json) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        userId,
        text.trim(),
        nlpResult.sentiment,
        nlpResult.intensity,
        nlpResult.dominant_emotion,
        JSON.stringify(nlpResult.emotions),
        JSON.stringify(nlpResult.flags || [])
      ]
    );

    // Update dynamic distress score incorporating new journal reflection features
    const features = await engineerFeaturesForUser(userId);
    const aiResult = await predictDistress(features);
    const recommendations = generateRecommendations(
      aiResult.distress_score,
      aiResult.risk_level,
      features,
      aiResult.contributing_factors
    );

    await run(
      'INSERT INTO predictions (user_id, distress_score, risk_level, contributing_factors_json, recommendations_json, feature_snapshot_json) VALUES (?, ?, ?, ?, ?, ?)',
      [
        userId,
        aiResult.distress_score,
        aiResult.risk_level,
        JSON.stringify(aiResult.contributing_factors),
        JSON.stringify(recommendations),
        JSON.stringify(features)
      ]
    );

    return res.status(201).json({
      message: 'Journal saved and analyzed by NLP engine.',
      journalId: result.lastID,
      nlp: nlpResult,
      prediction: {
        distress_score: aiResult.distress_score,
        risk_level: aiResult.risk_level,
        contributing_factors: aiResult.contributing_factors
      }
    });
  } catch (err) {
    console.error('Journal error:', err);
    return res.status(500).json({ error: 'Failed to process journal entry.' });
  }
});

// Live NLP preview (without saving) for real-time feedback
router.post('/preview', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    const nlpResult = await analyzeJournal(text || '');
    return res.json(nlpResult);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to analyze text preview.' });
  }
});

// Get user's journal entries
router.get('/', requireAuth, async (req, res) => {
  try {
    const journals = await all(
      'SELECT id, text, sentiment, intensity, dominant_emotion, emotions_json, flags_json, created_at FROM journals WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );

    const parsed = journals.map(j => ({
      ...j,
      emotions: j.emotions_json ? JSON.parse(j.emotions_json) : {},
      flags: j.flags_json ? JSON.parse(j.flags_json) : []
    }));

    return res.json({ journals: parsed });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch journals.' });
  }
});

module.exports = router;
