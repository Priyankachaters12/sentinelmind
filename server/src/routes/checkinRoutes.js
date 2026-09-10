const express = require('express');
const { run, all } = require('../db');
const { requireAuth } = require('../auth');
const { engineerFeaturesForUser } = require('../services/featureEngineer');
const { predictDistress } = require('../services/aiClient');
const { generateRecommendations } = require('../services/recommendationEngine');

const router = express.Router();

// Record daily check-in
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      mood = 5,
      stress = 5,
      anxiety = 5,
      sleep = 5,
      energy = 5,
      social = 5,
      note = ''
    } = req.body;

    // Validate ranges 1 to 10
    const clampedMood = Math.max(1, Math.min(10, Number(mood)));
    const clampedStress = Math.max(1, Math.min(10, Number(stress)));
    const clampedAnxiety = Math.max(1, Math.min(10, Number(anxiety)));
    const clampedSleep = Math.max(1, Math.min(10, Number(sleep)));
    const clampedEnergy = Math.max(1, Math.min(10, Number(energy)));
    const clampedSocial = Math.max(1, Math.min(10, Number(social)));

    const result = await run(
      'INSERT INTO checkins (user_id, mood, stress, anxiety, sleep, energy, social, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, clampedMood, clampedStress, clampedAnxiety, clampedSleep, clampedEnergy, clampedSocial, (note || '').trim()]
    );

    // Dynamic AI prediction recalculation
    const features = await engineerFeaturesForUser(userId);
    const aiResult = await predictDistress(features);
    const recommendations = generateRecommendations(
      aiResult.distress_score,
      aiResult.risk_level,
      features,
      aiResult.contributing_factors
    );

    // Save prediction record
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
      message: 'Daily check-in recorded and dynamic distress score updated.',
      checkinId: result.lastID,
      prediction: {
        distress_score: aiResult.distress_score,
        risk_level: aiResult.risk_level,
        contributing_factors: aiResult.contributing_factors,
        recommendations
      }
    });
  } catch (err) {
    console.error('Checkin error:', err);
    return res.status(500).json({ error: 'Failed to record check-in.' });
  }
});

// Fetch check-in history
router.get('/', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const checkins = await all(
      'SELECT id, mood, stress, anxiety, sleep, energy, social, note, created_at FROM checkins WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [req.user.id, limit]
    );
    return res.json({ checkins });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve check-ins.' });
  }
});

module.exports = router;
