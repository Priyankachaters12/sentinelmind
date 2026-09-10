const express = require('express');
const { run, get, all } = require('../db');
const { requireAuth } = require('../auth');
const { engineerFeaturesForUser } = require('../services/featureEngineer');
const { predictDistress } = require('../services/aiClient');
const { generateRecommendations } = require('../services/recommendationEngine');

const router = express.Router();

function getPhq9Severity(score) {
  if (score <= 4) return 'Minimal or No Depression Symptoms';
  if (score <= 9) return 'Mild Depressive Symptoms';
  if (score <= 14) return 'Moderate Depressive Symptoms';
  if (score <= 19) return 'Moderately Severe Depressive Symptoms';
  return 'Severe Depressive Symptoms';
}

function getGad7Severity(score) {
  if (score <= 4) return 'Minimal Anxiety Symptoms';
  if (score <= 9) return 'Mild Anxiety Symptoms';
  if (score <= 14) return 'Moderate Anxiety Symptoms';
  return 'Severe Anxiety Symptoms';
}

// Submit screening assessment (PHQ-9 or GAD-7)
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, responses } = req.body;

    if (!type || !['PHQ-9', 'GAD-7'].includes(type.toUpperCase())) {
      return res.status(400).json({ error: 'Assessment type must be either PHQ-9 or GAD-7.' });
    }

    const testType = type.toUpperCase();
    let score = 0;

    if (Array.isArray(responses)) {
      score = responses.reduce((acc, val) => acc + (Number(val) || 0), 0);
    } else if (typeof req.body.score === 'number') {
      score = Number(req.body.score);
    } else {
      return res.status(400).json({ error: 'Valid responses array or numerical score required.' });
    }

    const maxScore = testType === 'PHQ-9' ? 27 : 21;
    score = Math.max(0, Math.min(maxScore, score));

    const severity = testType === 'PHQ-9' ? getPhq9Severity(score) : getGad7Severity(score);

    // Fetch previous score for delta calculation
    const previous = await get(
      'SELECT score, created_at FROM assessments WHERE user_id = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
      [userId, testType]
    );

    const delta = previous ? score - previous.score : 0;

    const result = await run(
      'INSERT INTO assessments (user_id, type, score, severity, responses_json) VALUES (?, ?, ?, ?, ?)',
      [userId, testType, score, severity, JSON.stringify(responses || [])]
    );

    // Recalculate dynamic distress risk with new assessment feature
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
      message: `${testType} screening assessment recorded successfully.`,
      assessment: {
        id: result.lastID,
        type: testType,
        score,
        severity,
        previous_score: previous ? previous.score : null,
        delta,
        disclaimer: `${testType} is a clinical screening tool to track symptom frequency, not a clinical diagnosis.`
      },
      prediction: {
        distress_score: aiResult.distress_score,
        risk_level: aiResult.risk_level,
        contributing_factors: aiResult.contributing_factors
      }
    });
  } catch (err) {
    console.error('Assessment submission error:', err);
    return res.status(500).json({ error: 'Failed to record assessment.' });
  }
});

// Fetch latest assessments and delta
router.get('/latest', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const phq9List = await all(
      'SELECT score, severity, created_at FROM assessments WHERE user_id = ? AND type = "PHQ-9" ORDER BY created_at DESC LIMIT 2',
      [userId]
    );
    const gad7List = await all(
      'SELECT score, severity, created_at FROM assessments WHERE user_id = ? AND type = "GAD-7" ORDER BY created_at DESC LIMIT 2',
      [userId]
    );

    const latestPhq9 = phq9List[0] || null;
    const prevPhq9 = phq9List[1] || null;
    const latestGad7 = gad7List[0] || null;
    const prevGad7 = gad7List[1] || null;

    return res.json({
      phq9: latestPhq9 ? {
        score: latestPhq9.score,
        severity: latestPhq9.severity,
        date: latestPhq9.created_at,
        delta: prevPhq9 ? latestPhq9.score - prevPhq9.score : 0
      } : null,
      gad7: latestGad7 ? {
        score: latestGad7.score,
        severity: latestGad7.severity,
        date: latestGad7.created_at,
        delta: prevGad7 ? latestGad7.score - prevGad7.score : 0
      } : null
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve latest assessments.' });
  }
});

// Fetch assessment history
router.get('/', requireAuth, async (req, res) => {
  try {
    const assessments = await all(
      'SELECT id, type, score, severity, created_at FROM assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
      [req.user.id]
    );
    return res.json({ assessments });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch assessment history.' });
  }
});

module.exports = router;
