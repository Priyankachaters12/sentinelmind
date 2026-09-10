const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'sentinelmind.db');

let db;
try {
  db = new DatabaseSync(DB_PATH);
  console.log('[SentinelMind DB] Connected to native SQLite database at', DB_PATH);
} catch (err) {
  console.error('[SentinelMind DB] Database connection error:', err.message);
}

// Helpers matching async interface
const run = async (sql, params = []) => {
  const stmt = db.prepare(sql);
  const result = stmt.run(...params);
  return {
    lastID: Number(result.lastInsertRowid),
    changes: result.changes
  };
};

const get = async (sql, params = []) => {
  const stmt = db.prepare(sql);
  const row = stmt.get(...params);
  return row || null;
};

const all = async (sql, params = []) => {
  const stmt = db.prepare(sql);
  const rows = stmt.all(...params);
  return rows || [];
};

// Initialize schema
const initDB = async () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      consent INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      mood REAL NOT NULL,
      stress REAL NOT NULL,
      anxiety REAL NOT NULL,
      sleep REAL NOT NULL,
      energy REAL NOT NULL,
      social REAL NOT NULL,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS journals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      sentiment REAL DEFAULT 0.0,
      intensity REAL DEFAULT 0.0,
      dominant_emotion TEXT DEFAULT 'neutral',
      emotions_json TEXT,
      flags_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      score INTEGER NOT NULL,
      severity TEXT NOT NULL,
      responses_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      distress_score REAL NOT NULL,
      risk_level TEXT NOT NULL,
      contributing_factors_json TEXT,
      recommendations_json TEXT,
      feature_snapshot_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  console.log('[SentinelMind DB] All database tables verified & initialized.');
};

module.exports = {
  db,
  run,
  get,
  all,
  initDB
};
