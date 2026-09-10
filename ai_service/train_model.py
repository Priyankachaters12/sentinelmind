"""
SentinelMind AI/ML Model Training Pipeline
Trains a Scikit-Learn Random Forest model to predict dynamic distress scores (0 - 100)
and derives feature importances for Explainable AI (XAI).
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
import os

FEATURE_NAMES = [
    "mood",                  # 1 - 10 (lower is worse)
    "stress",                # 1 - 10 (higher is worse)
    "anxiety",               # 1 - 10 (higher is worse)
    "sleep",                 # 1 - 10 (lower is worse)
    "energy",                # 1 - 10 (lower is worse)
    "social",                # 1 - 10 (lower is worse)
    "phq9",                  # 0 - 27 (standardized depression screening)
    "gad7",                  # 0 - 21 (standardized anxiety screening)
    "journal_sentiment",     # -1.0 to 1.0 (lower is more negative)
    "emotional_intensity",   # 0.0 to 1.0
    "mood_7d_avg",           # 1 - 10 (rolling 7d average)
    "anxiety_delta",         # -9 to +9 (recent change)
    "sleep_deterioration",   # -9 to +9 (drop in sleep quality)
    "historical_trend"       # -1.0 (improving) to +1.0 (worsening)
]

def generate_synthetic_clinical_dataset(n_samples=5000, seed=42):
    """
    Generates a medically aligned longitudinal dataset representing multi-modal signals
    from daily check-ins, screening tools, and NLP reflections.
    """
    np.random.seed(seed)

    # Base underlying latent distress factor (0 to 1)
    latent_distress = np.random.beta(a=2, b=3, size=n_samples)

    # Core daily parameters correlated with latent distress
    mood = np.clip(np.round((1 - latent_distress) * 9 + 1 + np.random.normal(0, 0.9, n_samples)), 1, 10)
    stress = np.clip(np.round(latent_distress * 9 + 1 + np.random.normal(0, 0.9, n_samples)), 1, 10)
    anxiety = np.clip(np.round(latent_distress * 9 + 1 + np.random.normal(0, 1.0, n_samples)), 1, 10)
    sleep = np.clip(np.round((1 - latent_distress) * 9 + 1 + np.random.normal(0, 1.1, n_samples)), 1, 10)
    energy = np.clip(np.round((1 - latent_distress) * 9 + 1 + np.random.normal(0, 1.0, n_samples)), 1, 10)
    social = np.clip(np.round((1 - latent_distress) * 9 + 1 + np.random.normal(0, 1.2, n_samples)), 1, 10)

    # Screening questionnaires (PHQ-9: 0-27, GAD-7: 0-21)
    phq9 = np.clip(np.round(latent_distress * 24 + np.random.normal(0, 2.5, n_samples)), 0, 27)
    gad7 = np.clip(np.round(latent_distress * 19 + np.random.normal(0, 2.0, n_samples)), 0, 21)

    # NLP journal sentiment and emotional intensity
    journal_sentiment = np.clip((1 - latent_distress * 2) + np.random.normal(0, 0.25, n_samples), -1.0, 1.0)
    emotional_intensity = np.clip(latent_distress * 0.7 + np.random.uniform(0.1, 0.3, n_samples), 0.0, 1.0)

    # Longitudinal rolling & trajectory signals
    mood_7d_avg = np.clip(mood + np.random.normal(0, 0.8, n_samples), 1, 10)
    anxiety_delta = np.clip(np.random.normal((latent_distress - 0.4) * 4, 1.5, n_samples), -8, 8)
    sleep_deterioration = np.clip(np.random.normal((latent_distress - 0.4) * 3.5, 1.5, n_samples), -8, 8)
    historical_trend = np.clip((latent_distress - 0.5) * 1.8 + np.random.normal(0, 0.2, n_samples), -1.0, 1.0)

    # Non-linear composite distress calculation (ground truth target)
    raw_score = (
        (10 - mood) * 3.0 +
        stress * 2.8 +
        anxiety * 3.2 +
        (10 - sleep) * 2.5 +
        (10 - energy) * 1.8 +
        (10 - social) * 1.5 +
        (phq9 / 27.0) * 22.0 +
        (gad7 / 21.0) * 18.0 +
        (-journal_sentiment * 10.0) +
        (emotional_intensity * 6.0) +
        (10 - mood_7d_avg) * 1.5 +
        (anxiety_delta * 1.5) +
        (sleep_deterioration * 1.2) +
        (historical_trend * 8.0)
    )

    # Normalize to 0 - 100 with smooth sigmoid-like compression at extremes
    distress_score = np.clip(raw_score * 0.55 + np.random.normal(0, 2.0, n_samples), 0.0, 100.0)
    distress_score = np.round(distress_score, 1)

    df = pd.DataFrame({
        "mood": mood,
        "stress": stress,
        "anxiety": anxiety,
        "sleep": sleep,
        "energy": energy,
        "social": social,
        "phq9": phq9,
        "gad7": gad7,
        "journal_sentiment": np.round(journal_sentiment, 2),
        "emotional_intensity": np.round(emotional_intensity, 2),
        "mood_7d_avg": np.round(mood_7d_avg, 1),
        "anxiety_delta": np.round(anxiety_delta, 1),
        "sleep_deterioration": np.round(sleep_deterioration, 1),
        "historical_trend": np.round(historical_trend, 2),
        "distress_score": distress_score
    })

    return df

def train():
    print("[SentinelMind] Generating synthetic clinical training dataset...")
    df = generate_synthetic_clinical_dataset(n_samples=6000)

    X = df[FEATURE_NAMES]
    y = df["distress_score"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print(f"[SentinelMind] Training Random Forest Regressor on {len(X_train)} samples...")
    model = RandomForestRegressor(
        n_estimators=120,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))

    print("================ MODEL PERFORMANCE ================")
    print(f"R-squared Score (R2) : {r2:.4f}")
    print(f"Mean Absolute Error  : {mae:.2f} points (on 0-100 scale)")
    print(f"Root Mean Sq Error   : {rmse:.2f} points")
    print("====================================================")

    # Feature importances for XAI
    importances = dict(zip(FEATURE_NAMES, [round(float(imp), 4) for imp in model.feature_importances_]))
    sorted_importances = sorted(importances.items(), key=lambda x: x[1], reverse=True)
    print("\n[SentinelMind] Global Feature Importances (XAI):")
    for feat, imp in sorted_importances:
        print(f"  - {feat:20s}: {imp * 100:.1f}%")

    model_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(model_dir, "sentinel_model.joblib")

    artifact = {
        "model": model,
        "feature_names": FEATURE_NAMES,
        "metrics": {"r2": round(r2, 4), "mae": round(mae, 2), "rmse": round(rmse, 2)},
        "global_importances": importances,
        "baselines": {col: float(X[col].mean()) for col in FEATURE_NAMES}
    }

    joblib.dump(artifact, model_path)
    print(f"\n[SentinelMind] Model artifact saved to: {model_path}")
    return artifact

if __name__ == "__main__":
    train()
