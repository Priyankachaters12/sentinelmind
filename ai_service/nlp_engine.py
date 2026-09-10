"""
SentinelMind NLP Engine
Extracts sentiment polarity, emotional intensity, and clinical/distress emotion signals
from free-form journal entries.
"""
import re

# Domain-specific sentiment & emotion lexicons tailored for mental wellness screening
EMOTION_LEXICON = {
    "anxiety": [
        "anxious", "anxiety", "panic", "worried", "worry", "nervous", "terrified",
        "dread", "restless", "on edge", "racing", "uneasy", "jittery", "apprehensive",
        "overthinking", "scared", "fear", "shaking", "tense"
    ],
    "sadness": [
        "sad", "depressed", "hopeless", "unhappy", "crying", "miserable", "sorrow",
        "heartbroken", "gloomy", "empty", "numb", "worthless", "grief", "down",
        "pointless", "exhausted", "bleak", "heavy"
    ],
    "stress": [
        "stressed", "stress", "overwhelmed", "pressure", "burnout", "burnt out",
        "too much", "deadline", "hectic", "suffocating", "drowning", "can't cope",
        "cannot cope", "swamped", "overloaded", "frazzled"
    ],
    "isolation": [
        "lonely", "alone", "isolated", "nobody", "no one", "disconnected", "abandoned",
        "distant", "rejected", "alienated", "unloved", "ignored", "invisible", "misunderstood"
    ],
    "anger": [
        "angry", "furious", "mad", "frustrated", "rage", "irritated", "annoyed",
        "bitter", "resentful", "hate", "hostile", "outraged"
    ],
    "positive": [
        "happy", "hopeful", "calm", "peaceful", "grateful", "joy", "relaxed",
        "optimistic", "refreshed", "content", "loved", "supported", "good", "great",
        "better", "improved", "strong", "accomplished", "serene", "fine", "okay"
    ]
}

INTENSIFIERS = {
    "very": 1.4, "extremely": 1.8, "deeply": 1.6, "so": 1.3, "really": 1.4,
    "completely": 1.7, "totally": 1.6, "utterly": 1.9, "absolutely": 1.8,
    "unbearably": 2.0, "terribly": 1.7, "insanely": 1.8
}

NEGATIONS = {
    "not", "no", "never", "can't", "cannot", "hardly", "barely", "scarcely", "without", "don't", "didn't", "won't"
}

def clean_text(text: str) -> str:
    """Lowercase and clean text for analysis."""
    text = text.lower()
    text = re.sub(r"[^\w\s\'-]", " ", text)
    return " ".join(text.split())

def analyze_journal_text(text: str) -> dict:
    """
    Analyze journal text and return sentiment polarity (-1.0 to 1.0),
    emotional intensity (0.0 to 1.0), and detected emotion signals.
    """
    if not text or not text.strip():
        return {
            "sentiment": 0.0,
            "intensity": 0.0,
            "emotions": {k: 0.0 for k in EMOTION_LEXICON.keys()},
            "dominant_emotion": "neutral",
            "flags": []
        }

    cleaned = clean_text(text)
    words = cleaned.split()
    n_words = max(len(words), 1)

    emotion_counts = {k: 0.0 for k in EMOTION_LEXICON.keys()}
    flags = []

    # Check for critical self-harm or emergency signal phrases
    critical_patterns = [
        "end my life", "suicide", "want to die", "better off dead",
        "harm myself", "kill myself", "no reason to live"
    ]
    for cp in critical_patterns:
        if cp in cleaned:
            flags.append("URGENT_DISTRESS_FLAG")
            emotion_counts["sadness"] += 3.0
            emotion_counts["anxiety"] += 2.0

    # Scan for emotion keywords and context
    for i, word in enumerate(words):
        # Look behind for negation (e.g. "not happy", "never calm")
        is_negated = False
        multiplier = 1.0

        if i > 0 and words[i-1] in NEGATIONS:
            is_negated = True
        elif i > 1 and words[i-2] in NEGATIONS:
            is_negated = True

        # Look behind for intensifiers (e.g. "extremely anxious")
        if i > 0 and words[i-1] in INTENSIFIERS:
            multiplier = INTENSIFIERS[words[i-1]]

        for emotion, keywords in EMOTION_LEXICON.items():
            if word in keywords:
                if is_negated:
                    # If positive word negated -> sadness/anxiety signal
                    if emotion == "positive":
                        emotion_counts["sadness"] += 0.8 * multiplier
                    else:
                        emotion_counts[emotion] += 0.2 * multiplier
                else:
                    emotion_counts[emotion] += 1.0 * multiplier

    # Multi-word phrase check
    for phrase in ["on edge", "burnt out", "too much", "can't cope", "cannot cope"]:
        if phrase in cleaned:
            emotion_counts["stress"] += 1.5

    # Calculate sentiment polarity: -1.0 (most negative) to +1.0 (most positive)
    negative_score = (
        emotion_counts["anxiety"] * 1.1 +
        emotion_counts["sadness"] * 1.2 +
        emotion_counts["stress"] * 1.0 +
        emotion_counts["isolation"] * 1.1 +
        emotion_counts["anger"] * 0.9
    )
    positive_score = emotion_counts["positive"] * 1.3

    total_emotional_mass = negative_score + positive_score
    if total_emotional_mass > 0:
        sentiment = (positive_score - negative_score) / (total_emotional_mass + 1.0)
    else:
        sentiment = 0.0

    # Clamp sentiment to [-1.0, 1.0]
    sentiment = max(-1.0, min(1.0, round(sentiment, 2)))

    # Calculate emotional intensity [0.0, 1.0]
    intensity = min(1.0, round(total_emotional_mass / (n_words * 0.3 + 2.0), 2))

    # Normalize emotion scores into 0-1 confidence signals
    normalized_emotions = {}
    for emo, score in emotion_counts.items():
        normalized_emotions[emo] = round(min(1.0, score / 3.0), 2)

    # Determine dominant emotion
    dominant = "neutral"
    max_val = 0.2
    for emo, val in normalized_emotions.items():
        if val > max_val:
            max_val = val
            dominant = emo

    return {
        "sentiment": sentiment,
        "intensity": intensity,
        "emotions": normalized_emotions,
        "dominant_emotion": dominant,
        "flags": flags
    }


if __name__ == "__main__":
    sample = "I have been feeling very stressed lately and I don't feel connected to anyone."
    print("Sample Analysis:", analyze_journal_text(sample))
