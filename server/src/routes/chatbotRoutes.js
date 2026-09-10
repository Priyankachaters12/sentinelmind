const express = require('express');
const { requireAuth } = require('../auth');

const router = express.Router();

// Fallback / standard mental wellness AI assistant response generator
function generateAIResponse(message, distressContext) {
  const lowerMsg = (message || '').toLowerCase();
  const score = distressContext?.score ?? 35;
  const riskLevel = distressContext?.risk_level || 'moderate';

  // Emergency / Crisis intent
  if (
    lowerMsg.includes('suicide') || 
    lowerMsg.includes('kill myself') || 
    lowerMsg.includes('end it all') || 
    lowerMsg.includes('hurt myself') || 
    lowerMsg.includes('die') ||
    lowerMsg.includes('emergency') ||
    lowerMsg.includes('crisis')
  ) {
    return {
      reply: "I hear how much pain you're in right now, but please know that you are not alone and support is available immediately. Please connect with a trained professional right now. You can call or text 988 (Suicide & Crisis Lifeline) available 24/7, free and confidential, or text HOME to 741741 to connect with Crisis Text Line.",
      isEmergency: true,
      suggestedActions: [
        { label: 'Call 988 Lifeline', action: 'call_988' },
        { label: 'Send Emergency Alert', action: 'open_alert_sender' },
        { label: 'Try 4-7-8 Breathing', action: 'open_grounding' }
      ]
    };
  }

  // Anxiety / Panic / Stress
  if (lowerMsg.includes('anxi') || lowerMsg.includes('panic') || lowerMsg.includes('stress') || lowerMsg.includes('overwhelm') || lowerMsg.includes('fear')) {
    return {
      reply: `I understand that you're feeling anxious or overwhelmed right now. High stress levels activate your nervous system's fight-or-flight response. 

Here are three gentle steps you can take immediately:
1. **Focus on slow breathing**: Inhale for 4s, hold for 7s, exhale for 8s (use our built-in 4-7-8 Breath tool).
2. **5-4-3-2-1 Grounding**: Acknowledge 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste.
3. **Write it out**: Journaling your thoughts helps release cognitive tension.`,
      isEmergency: false,
      suggestedActions: [
        { label: 'Start 4-7-8 Breathing', action: 'open_grounding' },
        { label: 'Write Journal Entry', action: 'open_journal' }
      ]
    };
  }

  // Sleep issues
  if (lowerMsg.includes('sleep') || lowerMsg.includes('insomnia') || lowerMsg.includes('tired') || lowerMsg.includes('rest') || lowerMsg.includes('nightmare')) {
    return {
      reply: `Sleep disruption significantly impacts emotional regulation and cognitive energy. 

Tips for restorative sleep:
• **Wind-down routine**: Avoid screens 30-45 minutes before sleep.
• **Diaphragmatic breathing**: Slow 4-7-8 breathing reduces heart rate before bed.
• **Brain dump**: Write down lingering worries in your journal so your mind doesn't loop through them at night.`,
      isEmergency: false,
      suggestedActions: [
        { label: '4-7-8 Sleep Grounding', action: 'open_grounding' },
        { label: 'Log Sleep in Check-In', action: 'open_checkin' }
      ]
    };
  }

  // Depression / Sadness / Low Mood
  if (lowerMsg.includes('sad') || lowerMsg.includes('depress') || lowerMsg.includes('hopeless') || lowerMsg.includes('lonely') || lowerMsg.includes('empty')) {
    return {
      reply: `Thank you for sharing how you feel. Experiencing persistent sadness or low mood can make everyday activities feel heavy. 

Please remember:
• Small steps matter: Even taking a 5-minute walk or drinking a glass of water is a meaningful win.
• Track your symptoms: Consider taking a PHQ-9 screening to monitor symptom patterns over time.
• Reach out to loved ones or use our Emergency Distress Alert feature to stay connected with your support network.`,
      isEmergency: false,
      suggestedActions: [
        { label: 'Take PHQ-9 Screening', action: 'open_assessment' },
        { label: 'Send Distress Alert', action: 'open_alert_sender' }
      ]
    };
  }

  // Distress score inquiry
  if (lowerMsg.includes('score') || lowerMsg.includes('risk') || lowerMsg.includes('distress') || lowerMsg.includes('explain')) {
    return {
      reply: `Your current dynamic distress risk score is calculated using multi-modal data: your self-reported mood, stress, sleep, social connection, journal sentiment analysis, and screening deltas (PHQ-9 & GAD-7).

Your overall status is **${riskLevel.toUpperCase()}** (${score}/100). The Explainable AI card on your dashboard breaks down the exact contributing factors!`,
      isEmergency: false,
      suggestedActions: [
        { label: 'View Dashboard XAI', action: 'view_dashboard' },
        { label: 'Update Daily Check-In', action: 'open_checkin' }
      ]
    };
  }

  // Grounding / Breathing request
  if (lowerMsg.includes('ground') || lowerMsg.includes('breath') || lowerMsg.includes('calm') || lowerMsg.includes('meditat')) {
    return {
      reply: `Grounding exercises help re-anchor your awareness in the present physical moment, lowering physiological distress.

Our interactive **4-7-8 Breathing Tool** guides you through paced breathing cycles proven to calm the autonomic nervous system.`,
      isEmergency: false,
      suggestedActions: [
        { label: 'Open 4-7-8 Breathing', action: 'open_grounding' }
      ]
    };
  }

  // Default empathetic response
  return {
    reply: `I am here to support your mental wellness journey. Whether you want to discuss coping strategies, understand your distress risk factors, try a breathing exercise, or log a daily check-in, I'm here to assist.

How can I help you feel more supported today?`,
    isEmergency: false,
    suggestedActions: [
      { label: 'Start 4-7-8 Breathing', action: 'open_grounding' },
      { label: 'Take Screening', action: 'open_assessment' },
      { label: 'Write Journal', action: 'open_journal' }
    ]
  };
}

// POST /api/chatbot/message
router.post('/message', requireAuth, (req, res) => {
  try {
    const { message, distressContext } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const aiResult = generateAIResponse(message, distressContext);
    return res.json({
      timestamp: new Date().toISOString(),
      userMessage: message,
      reply: aiResult.reply,
      isEmergency: aiResult.isEmergency,
      suggestedActions: aiResult.suggestedActions
    });
  } catch (err) {
    console.error('Chatbot endpoint error:', err);
    return res.status(500).json({ error: 'Failed to process chatbot message.' });
  }
});

module.exports = router;
