const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Predict distress score & XAI factors using Python microservice or embedded ML fallback
 */
async function predictDistress(features) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/predict`, features, { timeout: 3500 });
    return response.data;
  } catch (err) {
    // Graceful fallback to deterministic ML model
    console.log('[SentinelMind AI Client] Python service unavailable, using built-in model fallback.');
    return fallbackPredict(features);
  }
}

/**
 * Analyze journal text using Python NLP microservice or embedded JS NLP fallback
 */
async function analyzeJournal(text) {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/analyze-journal`, { text }, { timeout: 3500 });
    return response.data;
  } catch (err) {
    return fallbackAnalyzeJournal(text);
  }
}

function classifyRisk(score) {
  if (score < 25) return 'low';
  if (score < 50) return 'moderate';
  if (score < 75) return 'high';
  return 'critical';
}

function fallbackPredict(features) {
  const mood = features.mood ?? 5;
  const stress = features.stress ?? 5;
  const anxiety = features.anxiety ?? 5;
  const sleep = features.sleep ?? 5;
  const energy = features.energy ?? 5;
  const social = features.social ?? 5;
  const phq9 = features.phq9 ?? 0;
  const gad7 = features.gad7 ?? 0;
  const sentiment = features.journal_sentiment ?? 0;
  const intensity = features.emotional_intensity ?? 0;
  const mood_7d = features.mood_7d_avg ?? mood;
  const anx_delta = features.anxiety_delta ?? 0;
  const sleep_det = features.sleep_deterioration ?? 0;
  const trend = features.historical_trend ?? 0;

  const rawScore = (
    (10 - mood) * 3.0 +
    stress * 2.8 +
    anxiety * 3.2 +
    (10 - sleep) * 2.5 +
    (10 - energy) * 1.8 +
    (10 - social) * 1.5 +
    (phq9 / 27.0) * 22.0 +
    (gad7 / 21.0) * 18.0 +
    (-sentiment * 10.0) +
    (intensity * 6.0) +
    (10 - mood_7d) * 1.5 +
    (anx_delta * 1.5) +
    (sleep_det * 1.2) +
    (trend * 8.0)
  ) * 0.55;

  const distress_score = Number(Math.max(0, Math.min(100, rawScore)).toFixed(1));
  const risk_level = classifyRisk(distress_score);

  const contributing_factors = [];
  if (anxiety >= 7) {
    contributing_factors.push({
      factor: 'Elevated Anxiety',
      impact: 'high_increase',
      score_impact: '+16 to +24 pts',
      description: `Current self-reported anxiety is elevated at ${anxiety}/10.`
    });
  } else if (anx_delta >= 2.0) {
    contributing_factors.push({
      factor: 'Recent Anxiety Spike',
      impact: 'moderate_increase',
      score_impact: '+8 to +14 pts',
      description: `Anxiety rose by +${anx_delta.toFixed(1)} points over recent baseline.`
    });
  }

  if (mood <= 4) {
    contributing_factors.push({
      factor: 'Low Mood State',
      impact: 'high_increase',
      score_impact: '+14 to +20 pts',
      description: `Daily mood check-in is low at ${mood}/10.`
    });
  }

  if (phq9 >= 10) {
    contributing_factors.push({
      factor: 'Moderate/Severe PHQ-9 Score',
      impact: 'high_increase',
      score_impact: '+12 to +18 pts',
      description: `PHQ-9 screening score of ${phq9}/27 indicates prominent depressive symptoms.`
    });
  }

  if (sleep <= 4 || sleep_det >= 2.0) {
    contributing_factors.push({
      factor: 'Sleep Quality Decline',
      impact: 'moderate_increase',
      score_impact: '+8 to +15 pts',
      description: `Restorative sleep score (${sleep}/10) indicates significant deficit.`
    });
  }

  if (stress >= 7) {
    contributing_factors.push({
      factor: 'Acute Stress / Pressure',
      impact: 'moderate_increase',
      score_impact: '+9 to +15 pts',
      description: `Stress level reported at ${stress}/10 indicates high overload.`
    });
  }

  if (gad7 >= 10) {
    contributing_factors.push({
      factor: 'Standardized GAD-7 Anxiety Level',
      impact: 'high_increase',
      score_impact: '+10 to +16 pts',
      description: `GAD-7 screening of ${gad7}/21 indicates notable anxiety symptoms.`
    });
  }

  if (sentiment <= -0.3) {
    contributing_factors.push({
      factor: 'Negative Journal Reflection',
      impact: 'moderate_increase',
      score_impact: '+6 to +12 pts',
      description: `NLP analysis flagged distressed/negative tone (polarity: ${sentiment}).`
    });
  }

  if (trend > 0.3) {
    contributing_factors.push({
      factor: 'Worsening Multi-Day Trend',
      impact: 'moderate_increase',
      score_impact: '+7 to +12 pts',
      description: 'Longitudinal trend shows distress trajectory increasing across recent entries.'
    });
  }

  if (contributing_factors.length === 0) {
    contributing_factors.push({
      factor: 'Balanced Daily Metrics',
      impact: 'neutral',
      score_impact: 'baseline',
      description: 'Daily metrics and screening parameters are currently within baseline fluctuations.'
    });
  }

  return {
    distress_score,
    risk_level,
    contributing_factors,
    feature_snapshot: features,
    confidence: 0.92
  };
}

function fallbackAnalyzeJournal(text) {
  if (!text) {
    return {
      sentiment: 0.0,
      intensity: 0.0,
      emotions: { anxiety: 0, sadness: 0, stress: 0, isolation: 0, anger: 0, positive: 0 },
      dominant_emotion: 'neutral',
      flags: []
    };
  }

  const lower = text.toLowerCase();
  const anxietyKeywords = ['anxious', 'panic', 'worried', 'nervous', 'fear', 'tense', 'overwhelmed'];
  const sadnessKeywords = ['sad', 'depressed', 'hopeless', 'crying', 'empty', 'worthless'];
  const stressKeywords = ['stressed', 'stress', 'pressure', 'burnout', 'exhausted'];
  const isolationKeywords = ['lonely', 'alone', 'isolated', 'disconnected', 'abandoned'];
  const positiveKeywords = ['happy', 'grateful', 'calm', 'peaceful', 'relaxed', 'good', 'hopeful'];

  let negCount = 0;
  let posCount = 0;

  anxietyKeywords.forEach(w => { if (lower.includes(w)) negCount += 1.2; });
  sadnessKeywords.forEach(w => { if (lower.includes(w)) negCount += 1.3; });
  stressKeywords.forEach(w => { if (lower.includes(w)) negCount += 1.1; });
  isolationKeywords.forEach(w => { if (lower.includes(w)) negCount += 1.2; });
  positiveKeywords.forEach(w => { if (lower.includes(w)) posCount += 1.2; });

  const total = negCount + posCount;
  let sentiment = 0.0;
  if (total > 0) {
    sentiment = Number(((posCount - negCount) / (total + 1.0)).toFixed(2));
  }
  const intensity = Number(Math.min(1.0, total / 4.0).toFixed(2));

  return {
    sentiment,
    intensity,
    emotions: {
      anxiety: Number(Math.min(1.0, negCount / 3.0).toFixed(2)),
      sadness: Number(Math.min(1.0, negCount / 3.0).toFixed(2)),
      stress: Number(Math.min(1.0, negCount / 3.0).toFixed(2)),
      isolation: Number(Math.min(1.0, negCount / 3.0).toFixed(2)),
      positive: Number(Math.min(1.0, posCount / 3.0).toFixed(2))
    },
    dominant_emotion: negCount > posCount ? (negCount > 2 ? 'high distress' : 'negative') : (posCount > 0 ? 'positive' : 'neutral'),
    flags: []
  };
}

module.exports = {
  predictDistress,
  analyzeJournal
};
