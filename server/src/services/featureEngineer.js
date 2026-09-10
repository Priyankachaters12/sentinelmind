const { all, get } = require('../db');

/**
 * Computes longitudinal features for AI prediction:
 * - Current structured metrics (mood, stress, anxiety, sleep, energy, social)
 * - Standardized screenings (PHQ-9, GAD-7)
 * - NLP Journal sentiment & intensity
 * - 7-day rolling statistics, deltas, and trajectory slope
 */
async function engineerFeaturesForUser(userId) {
  // 1. Fetch recent check-ins (up to 14 entries)
  const checkins = await all(
    'SELECT mood, stress, anxiety, sleep, energy, social, created_at FROM checkins WHERE user_id = ? ORDER BY created_at DESC LIMIT 14',
    [userId]
  );

  // Latest values or safe defaults
  const latestCheckin = checkins[0] || {
    mood: 5.0,
    stress: 5.0,
    anxiety: 5.0,
    sleep: 6.0,
    energy: 5.0,
    social: 5.0
  };

  // 2. Rolling averages & deltas
  let mood_7d_avg = latestCheckin.mood;
  let anxiety_delta = 0.0;
  let sleep_deterioration = 0.0;
  let historical_trend = 0.0;

  if (checkins.length > 1) {
    const pastCheckins = checkins.slice(0, 7);
    const sumMood = pastCheckins.reduce((acc, c) => acc + c.mood, 0);
    mood_7d_avg = Number((sumMood / pastCheckins.length).toFixed(1));

    // Compare latest with baseline of previous checkins
    const prevCheckins = checkins.slice(1);
    const prevAvgAnxiety = prevCheckins.reduce((acc, c) => acc + c.anxiety, 0) / prevCheckins.length;
    anxiety_delta = Number((latestCheckin.anxiety - prevAvgAnxiety).toFixed(1));

    const prevAvgSleep = prevCheckins.reduce((acc, c) => acc + c.sleep, 0) / prevCheckins.length;
    sleep_deterioration = Number((prevAvgSleep - latestCheckin.sleep).toFixed(1));

    // Trajectory slope over recent points: check if anxiety/stress are growing or mood is falling
    // Chronological order for trend
    const chrono = [...checkins].reverse();
    if (chrono.length >= 3) {
      // Simple linear slope of composite distress approximation
      const n = chrono.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      chrono.forEach((item, idx) => {
        const approxDistress = (10 - item.mood) + item.stress + item.anxiety + (10 - item.sleep);
        sumX += idx;
        sumY += approxDistress;
        sumXY += idx * approxDistress;
        sumXX += idx * idx;
      });
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
      // Normalize slope into [-1.0, 1.0]
      historical_trend = Number(Math.max(-1.0, Math.min(1.0, slope / 2.0)).toFixed(2));
    }
  }

  // 3. Fetch latest PHQ-9 & GAD-7 assessments
  const latestPhq9 = await get(
    'SELECT score FROM assessments WHERE user_id = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
    [userId, 'PHQ-9']
  );
  const latestGad7 = await get(
    'SELECT score FROM assessments WHERE user_id = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
    [userId, 'GAD-7']
  );

  const phq9_score = latestPhq9 ? latestPhq9.score : 4;
  const gad7_score = latestGad7 ? latestGad7.score : 3;

  // 4. Fetch latest journals (last 3)
  const recentJournals = await all(
    'SELECT sentiment, intensity FROM journals WHERE user_id = ? ORDER BY created_at DESC LIMIT 3',
    [userId]
  );

  let journal_sentiment = 0.0;
  let emotional_intensity = 0.0;

  if (recentJournals.length > 0) {
    const sumSent = recentJournals.reduce((acc, j) => acc + (j.sentiment || 0), 0);
    journal_sentiment = Number((sumSent / recentJournals.length).toFixed(2));

    const sumInt = recentJournals.reduce((acc, j) => acc + (j.intensity || 0), 0);
    emotional_intensity = Number((sumInt / recentJournals.length).toFixed(2));
  }

  return {
    mood: Number(latestCheckin.mood),
    stress: Number(latestCheckin.stress),
    anxiety: Number(latestCheckin.anxiety),
    sleep: Number(latestCheckin.sleep),
    energy: Number(latestCheckin.energy),
    social: Number(latestCheckin.social),
    phq9: Number(phq9_score),
    gad7: Number(gad7_score),
    journal_sentiment,
    emotional_intensity,
    mood_7d_avg,
    anxiety_delta,
    sleep_deterioration,
    historical_trend
  };
}

module.exports = {
  engineerFeaturesForUser
};
