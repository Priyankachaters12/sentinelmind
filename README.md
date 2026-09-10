# SentinelMind — AI-Assisted Mental Wellness & Dynamic Distress Prediction Platform

> **SentinelMind collects mental-well-being data → processes it using AI/ML → calculates a dynamic distress score → explains the major contributing factors → provides appropriate support recommendations → tracks changes over time.**

---

## 1. Platform Overview

SentinelMind is an AI-assisted mental-health monitoring and distress-risk prediction platform designed for continuous wellness tracking and proactive distress mitigation. Users log daily metrics such as mood, stress, anxiety, sleep, energy, and social connection, alongside optional journal reflections and standardized screening instruments (PHQ-9 and GAD-7).

The React frontend communicates with a Node.js Express API layer and SQLite database. Engineered multi-modal features are evaluated by a Python AI microservice hosting NLP sentiment models and a Random Forest Regressor to compute dynamic distress risk (0 to 100). The Explainable AI (XAI) engine highlights behavioral drivers, while supportive coping protocols, interactive grounding exercises, AI chatbot assistance, and emergency distress alerts provide immediate assistance.

---

## 2. Complete Workflow & System Architecture

```
                                USER
                                  │
                                  ▼
                        ┌──────────────────┐
                        │ Registration/Auth │  (React + Express + bcrypt + JWT)
                        └────────┬─────────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │ Daily Check-In│  (Mood, Stress, Anxiety, Sleep, Energy, Social)
                         └───────┬───────┘
                                 │
                      ┌──────────┼──────────┐
                      ▼          ▼          ▼
                   Journal   PHQ-9/GAD-7  History
                   (Text)    (Screening)  (Trends)
                      │          │          │
                      └──────────┼──────────┘
                                 ▼
                        ┌─────────────────┐
                        │ AI / NLP Engine │  (Lexicon + Sentiment Polarity + Intensity)
                        └────────┬────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │ Feature Engineering   │  (7-day rolling averages, deltas, slope)
                     └───────────┬───────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ ML Prediction   │  (Random Forest Regressor)
                        └────────┬────────┘
                                 │
                                 ▼
                         DYNAMIC DISTRESS
                           SCORE: 0 – 100
                                 │
                                 ▼
                        ┌─────────────────┐
                        │ Risk Level Band │  (Low / Moderate / High / Critical)
                        └────────┬────────┘
                                 │
                      ┌──────────┼──────────┐
                      ▼          ▼          ▼
               Explainable AI Recommendations AI Chatbot & Alerts
             (Feature Drivers) (Coping/Breath)  (Conversational & SOS)
                      │          │          │
                      └──────────┼──────────┘
                                 ▼
                         RESPONSIVE DASHBOARD
                     (Mobile, Tablet, Desktop)
```

---

## 3. Technology Stack & Technical Rationale

| Layer | Technology | Technical Rationale & Role in SentinelMind |
| :--- | :--- | :--- |
| **Frontend UI** | **React.js (v18)** | Component-based, state-driven UI allowing real-time reactive updates as distress metrics shift. |
| **Build Tool** | **Vite (v6)** | Instant Hot-Module Replacement (HMR) and optimized minified production bundling. |
| **Styling** | **Tailwind CSS** | Responsive mobile-first utility classes, glassmorphism panels, and dynamic clinical color themes. |
| **Data Viz** | **Recharts** | Interactive SVG charts for longitudinal distress score tracking and multidimensional signals. |
| **Icons** | **Lucide-React** | Crisp, accessible clinical and navigational iconography. |
| **API Server** | **Node.js + Express** | High-concurrency event-driven REST API layer managing business logic, session validation, and data routing. |
| **Authentication**| **JWT + bcryptjs** | Secure salted password hashing and stateless token-based authorization for protected endpoints. |
| **Database** | **SQLite (Native)** | Zero-configuration, ACID-compliant relational storage via Node 22 native `node:sqlite`. |
| **AI / ML Service**| **Python + Flask** | Dedicated microservice hosting Scikit-Learn models and NLP pipelines on port `8000`. |
| **Machine Learning**| **Scikit-Learn** | Calibrated **Random Forest Regressor** ($R^2 > 0.98$) trained on longitudinal multi-modal clinical features. |
| **NLP Pipeline** | **Domain Sentiment Lexicon** | Tokenization, negation handling, intensity scoring, and multi-label emotion signal classification. |
| **Explainable AI** | **Attribution Engine** | Local feature contribution breakdown explaining *why* the score changed. |
| **AI Chatbot** | **Mental Wellness Assistant** | Interactive AI assistant providing empathetic guidance, coping strategies, and grounding advice. |
| **Distress Alert** | **Emergency Dispatcher** | Instant Email & SMS alert sender to notify trusted emergency contacts when in high distress. |

---

## 4. Key Mathematical & Scoring Principles

### A. Input Feature Vector ($X$)
$$X = [\text{mood}, \text{stress}, \text{anxiety}, \text{sleep}, \text{energy}, \text{social}, \text{phq9}, \text{gad7}, \text{sentiment}, \text{intensity}, \text{mood}_{7d}, \Delta\text{anxiety}, \Delta\text{sleep}, \text{slope}]$$

### B. Project-Defined Risk Bands (0 - 100)
- **0 – 24 (Low Risk)**: Emotional stability, normal baseline fluctuations.
- **25 – 49 (Moderate Risk)**: Mild elevated stress or disrupted sleep. Supportive self-care recommended.
- **50 – 74 (High Risk)**: Elevated anxiety/depressive screening signals and worsening trajectory.
- **75 – 100 (Critical Risk)**: Severe acute distress. Prompt escalation to 24/7 crisis hotlines (988) and emergency contacts.

### C. Screening vs Diagnosis
- **PHQ-9** (0-27) and **GAD-7** (0-21) measure symptom frequency over a 2-week period.
- They are standardized **screening instruments**, not automated diagnoses.

---

## 5. How to Run SentinelMind

### Option 1: One-Click Windows Launcher (Recommended)
Simply double-click:
```powershell
start_sentinelmind.bat
```
This automatically starts:
1. Python AI Microservice (`http://localhost:8000`)
2. Node.js Backend Server (`http://localhost:5000`)
3. React Vite Frontend (`http://localhost:5173`)
4. Opens your default web browser to the application dashboard.

---

### Option 2: Manual Terminal Execution

#### 1. Train or Verify AI Model
```bash
python ai_service/train_model.py
python ai_service/app.py
```

#### 2. Start Backend Server
```bash
cd server
npm start
```

#### 3. Start Frontend Client
```bash
cd client
npm run dev
```
Navigate to `http://localhost:5173`.
