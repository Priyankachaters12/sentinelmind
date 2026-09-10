/**
 * SentinelMind Dynamic Recommendation Engine
 * Generates personalized, non-clinical coping strategies, mindfulness protocols,
 * and escalation guidance based on distress score and contributing factors.
 */

function generateRecommendations(distressScore, riskLevel, features, contributingFactors = []) {
  const recommendations = [];

  // 1. Critical or High Risk Escalation
  if (riskLevel === 'critical' || riskLevel === 'high' || distressScore >= 50) {
    recommendations.push({
      id: 'crisis_support',
      category: 'Professional & Crisis Support',
      priority: 'urgent',
      icon: 'heart-pulse',
      title: 'Reach Out to Professional Support & Helplines',
      description: 'Your current distress level indicates significant emotional load. Consider connecting with a counselor, healthcare provider, or free confidential support line.',
      actionable_step: 'Call or text 988 (Suicide & Crisis Lifeline, available 24/7) or text HOME to 741741 (Crisis Text Line). You do not have to carry this alone.',
      badge: 'Immediate Resource'
    });
  }

  // 2. High Anxiety or Anxiety Delta
  if (features.anxiety >= 7 || features.anxiety_delta >= 2.0) {
    recommendations.push({
      id: 'breathing_grounding',
      category: 'Anxiety Reduction',
      priority: 'high',
      icon: 'wind',
      title: '4-7-8 Somatic Breathing Exercise',
      description: 'Down-regulate your sympathetic nervous system with paced diaphragmatic breathing.',
      actionable_step: 'Inhale through your nose for 4 seconds, hold gently for 7 seconds, and exhale completely with a whoosh for 8 seconds. Repeat 4 cycles.',
      badge: '5-Minute Tool'
    });
    recommendations.push({
      id: 'sensory_grounding',
      category: 'Mindfulness',
      priority: 'medium',
      icon: 'eye',
      title: '5-4-3-2-1 Sensory Grounding',
      description: 'Anchor yourself in the present moment when experiencing racing thoughts or worry spirals.',
      actionable_step: 'Notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.',
      badge: 'Grounding'
    });
  }

  // 3. Sleep Disruption or Deterioration
  if (features.sleep <= 4 || features.sleep_deterioration >= 2.0) {
    recommendations.push({
      id: 'sleep_hygiene',
      category: 'Restorative Sleep',
      priority: 'high',
      icon: 'moon',
      title: 'Digital Curfew & Wind-Down Protocol',
      description: 'Declining sleep quality significantly compounds psychological distress and emotional reactivity.',
      actionable_step: 'Place phone outside arm’s reach 45 minutes before sleep. Try dimming ambient lighting and listening to white noise or binaural beats.',
      badge: 'Sleep Routine'
    });
  }

  // 4. Stress & Overwhelm
  if (features.stress >= 7) {
    recommendations.push({
      id: 'cognitive_unload',
      category: 'Stress Management',
      priority: 'medium',
      icon: 'brain',
      title: 'Brain Dump & Priority Pruning',
      description: 'Reduce mental working-memory overload by offloading tasks onto paper.',
      actionable_step: 'Write down everything pressing in your mind. Pick only ONE non-negotiable task for today; defer or delegate the rest.',
      badge: 'Cognitive Offload'
    });
  }

  // 5. Low Mood or Low Energy
  if (features.mood <= 4 || features.energy <= 4) {
    recommendations.push({
      id: 'behavioral_activation',
      category: 'Mood Activation',
      priority: 'medium',
      icon: 'sun',
      title: 'Gentle Behavioral Activation (10-Min Walk)',
      description: 'Low mood often paralyzes motivation. Physical movement triggers endorphin release and dopamine reset.',
      actionable_step: 'Step outside for a short 10-minute walk in natural daylight without checking notifications.',
      badge: 'Gentle Movement'
    });
  }

  // 6. Social Isolation
  if (features.social <= 4) {
    recommendations.push({
      id: 'micro_connection',
      category: 'Social Connection',
      priority: 'medium',
      icon: 'users',
      title: 'Low-Pressure Micro-Connection',
      description: 'Isolation amplifies feelings of alienation and vulnerability.',
      actionable_step: 'Send a quick text or voice note to a friend, family member, or trusted peer just saying "Thinking of you today".',
      badge: 'Connection'
    });
  }

  // 7. General Maintenance / Positive Habit
  if (recommendations.length < 3) {
    recommendations.push({
      id: 'reflective_journal',
      category: 'Emotional Processing',
      priority: 'low',
      icon: 'book-open',
      title: 'Expressive Wellness Reflection',
      description: 'Writing about feelings and small daily wins strengthens self-compassion and emotional regulation.',
      actionable_step: 'Spend 3 minutes noting three small things that brought ease or comfort into your day.',
      badge: 'Daily Reflection'
    });
  }

  return recommendations;
}

module.exports = {
  generateRecommendations
};
