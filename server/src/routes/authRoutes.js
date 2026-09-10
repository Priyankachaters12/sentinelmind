const express = require('express');
const { run, get, all } = require('../db');
const { hashPassword, comparePassword, generateToken, requireAuth } = require('../auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, consent } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await hashPassword(password);
    const result = await run(
      'INSERT INTO users (name, email, password_hash, consent) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashedPassword, consent ? 1 : 0]
    );

    const newUser = {
      id: result.lastID,
      name: name.trim(),
      email: email.toLowerCase().trim()
    };

    const token = generateToken(newUser);
    return res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed due to server error.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide both email and password.' });
    }

    const user = await get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed due to server error.' });
  }
});

// One-Click Demo User Provisioning
router.post('/demo-login', async (req, res) => {
  try {
    const demoEmail = 'demo@sentinelmind.ai';
    let demoUser = await get('SELECT * FROM users WHERE email = ?', [demoEmail]);

    if (!demoUser) {
      const hashed = await hashPassword('sentinel123');
      const result = await run(
        'INSERT INTO users (name, email, password_hash, consent) VALUES (?, ?, ?, ?)',
        ['Wellness Explorer', demoEmail, hashed, 1]
      );
      demoUser = { id: result.lastID, name: 'Wellness Explorer', email: demoEmail };

      // Seed 7-day realistic longitudinal progression
      const mockDays = [
        { dayOffset: 6, mood: 7, stress: 4, anxiety: 3, sleep: 7, energy: 6, social: 7, note: 'Normal steady day' },
        { dayOffset: 5, mood: 6, stress: 5, anxiety: 4, sleep: 6, energy: 6, social: 6, note: 'Slightly busier than usual' },
        { dayOffset: 4, mood: 5, stress: 6, anxiety: 5, sleep: 5, energy: 5, social: 4, note: 'Work deadlines piling up' },
        { dayOffset: 3, mood: 4, stress: 7, anxiety: 6, sleep: 4, energy: 4, social: 4, note: 'Trouble falling asleep, feeling on edge' },
        { dayOffset: 2, mood: 4, stress: 8, anxiety: 7, sleep: 3, energy: 3, social: 3, note: 'Exhausted and feeling disconnected' },
        { dayOffset: 1, mood: 3, stress: 8, anxiety: 8, sleep: 4, energy: 3, social: 3, note: 'High tension, overwhelmed with projects' },
        { dayOffset: 0, mood: 4, stress: 7, anxiety: 7, sleep: 4, energy: 4, social: 3, note: 'Trying to ground myself today' }
      ];

      for (const d of mockDays) {
        const date = new Date(Date.now() - d.dayOffset * 86400000).toISOString();
        await run(
          'INSERT INTO checkins (user_id, mood, stress, anxiety, sleep, energy, social, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [demoUser.id, d.mood, d.stress, d.anxiety, d.sleep, d.energy, d.social, d.note, date]
        );
      }

      // Seed assessments (PHQ-9 and GAD-7)
      const prevDate = new Date(Date.now() - 5 * 86400000).toISOString();
      const currDate = new Date(Date.now() - 1 * 86400000).toISOString();

      await run(
        'INSERT INTO assessments (user_id, type, score, severity, responses_json, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [demoUser.id, 'PHQ-9', 8, 'Mild Depressive Symptoms', JSON.stringify([1,1,1,0,1,1,1,1,1]), prevDate]
      );
      await run(
        'INSERT INTO assessments (user_id, type, score, severity, responses_json, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [demoUser.id, 'PHQ-9', 14, 'Moderate Depressive Symptoms', JSON.stringify([2,2,1,2,2,1,2,1,1]), currDate]
      );

      await run(
        'INSERT INTO assessments (user_id, type, score, severity, responses_json, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [demoUser.id, 'GAD-7', 6, 'Mild Anxiety Symptoms', JSON.stringify([1,1,1,1,0,1,1]), prevDate]
      );
      await run(
        'INSERT INTO assessments (user_id, type, score, severity, responses_json, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [demoUser.id, 'GAD-7', 12, 'Moderate Anxiety Symptoms', JSON.stringify([2,2,2,1,2,2,1]), currDate]
      );

      // Seed journal
      await run(
        'INSERT INTO journals (user_id, text, sentiment, intensity, dominant_emotion, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [
          demoUser.id,
          "I have been feeling very stressed lately and I don't feel connected to anyone. Deadlines are exhausting.",
          -0.55,
          0.72,
          'stress',
          currDate
        ]
      );
    }

    const token = generateToken(demoUser);
    return res.json({
      message: 'Demo login successful with preloaded longitudinal data.',
      token,
      user: {
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email
      }
    });
  } catch (err) {
    console.error('Demo login error:', err);
    return res.status(500).json({ error: 'Demo login failed.' });
  }
});

// Current user profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await get('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

module.exports = router;
