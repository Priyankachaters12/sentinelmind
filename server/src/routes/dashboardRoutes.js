const express = require('express');
const { get, all, run } = require('../db');
const { requireAuth } = require('../auth');
const { engineerFeaturesForUser } = require('../services/featureEngineer');
const { predictDistress } = require('../services/aiClient');
const { generateRecommendations } = require('../services/recommendationEngine');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch latest prediction or compute on the fly
    let latestPrediction = await get(
      'SELECT * FROM predictions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    let features = await engineerFeaturesForUser(userId);

    if (!latestPrediction) {
      const aiResult = await predictDistress(features);
      const recommendations = generateRecommendations(
        aiResult.distress_score,
        aiResult.risk_level,
        features,
        aiResult.contributing_factors
      );

      const result = await run(
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

      latestPrediction = {
        id: result.lastID,
        user_id: userId,
        distress_score: aiResult.distress_score,
        risk_level: aiResult.risk_level,
        contributing_factors_json: JSON.stringify(aiResult.contributing_factors),
        recommendations_json: JSON.stringify(recommendations),
        created_at: new Date().toISOString()
      };
    }

    // 2. Fetch recent check-ins for interactive Recharts timeline (last 14 days)
    const checkinTimeline = await all(
      'SELECT mood, stress, anxiety, sleep, energy, social, note, created_at FROM checkins WHERE user_id = ? ORDER BY created_at ASC LIMIT 14',
      [userId]
    );

    // Fetch historical prediction timeline
    const predictionTimeline = await all(
      'SELECT distress_score, risk_level, created_at FROM predictions WHERE user_id = ? ORDER BY created_at ASC LIMIT 14',
      [userId]
    );

    // Merge or align timeline items for multi-metric chart
    const timeline = checkinTimeline.map((c, idx) => {
      const p = predictionTimeline[idx] || predictionTimeline[predictionTimeline.length - 1];
      const d = new Date(c.created_at);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        date: label,
        fullDate: c.created_at,
        mood: c.mood,
        stress: c.stress,
        anxiety: c.anxiety,
        sleep: c.sleep,
        energy: c.energy,
        social: c.social,
        distress: p ? p.distress_score : Math.round(((10 - c.mood) * 3 + c.stress * 2.8 + c.anxiety * 3.2 + (10 - c.sleep) * 2) * 0.55)
      };
    });

    // 3. Trajectory evaluation
    let trajectory = 'stable';
    if (features.historical_trend > 0.25) trajectory = 'worsening';
    else if (features.historical_trend < -0.25) trajectory = 'improving';

    // 4. Latest assessments
    const latestPhq9 = await get(
      'SELECT score, severity, created_at FROM assessments WHERE user_id = ? AND type = "PHQ-9" ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    const prevPhq9 = await get(
      'SELECT score FROM assessments WHERE user_id = ? AND type = "PHQ-9" ORDER BY created_at DESC LIMIT 1 OFFSET 1',
      [userId]
    );

    const latestGad7 = await get(
      'SELECT score, severity, created_at FROM assessments WHERE user_id = ? AND type = "GAD-7" ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    const prevGad7 = await get(
      'SELECT score FROM assessments WHERE user_id = ? AND type = "GAD-7" ORDER BY created_at DESC LIMIT 1 OFFSET 1',
      [userId]
    );

    // 5. Recent journals (up to 3)
    const recentJournals = await all(
      'SELECT id, text, sentiment, intensity, dominant_emotion, created_at FROM journals WHERE user_id = ? ORDER BY created_at DESC LIMIT 3',
      [userId]
    );

    return res.json({
      distress: {
        score: latestPrediction.distress_score,
        risk_level: latestPrediction.risk_level,
        trajectory,
        trend_slope: features.historical_trend,
        contributing_factors: latestPrediction.contributing_factors_json ? JSON.parse(latestPrediction.contributing_factors_json) : [],
        recommendations: latestPrediction.recommendations_json ? JSON.parse(latestPrediction.recommendations_json) : [],
        last_updated: latestPrediction.created_at
      },
      current_metrics: {
        mood: features.mood,
        stress: features.stress,
        anxiety: features.anxiety,
        sleep: features.sleep,
        energy: features.energy,
        social: features.social,
        mood_7d_avg: features.mood_7d_avg,
        anxiety_delta: features.anxiety_delta,
        sleep_deterioration: features.sleep_deterioration
      },
      screenings: {
        phq9: latestPhq9 ? {
          score: latestPhq9.score,
          severity: latestPhq9.severity,
          delta: prevPhq9 ? latestPhq9.score - prevPhq9.score : 0,
          date: latestPhq9.created_at
        } : null,
        gad7: latestGad7 ? {
          score: latestGad7.score,
          severity: latestGad7.severity,
          delta: prevGad7 ? latestGad7.score - prevGad7.score : 0,
          date: latestGad7.created_at
        } : null
      },
      timeline,
      recent_journals: recentJournals
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ error: 'Failed to load dashboard data.' });
  }
});

module.exports = router;
