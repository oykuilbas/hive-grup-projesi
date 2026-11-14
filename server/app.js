const express = require('express');
const db = require('./db');
const authRoutes = require('./routes/authRoutes');

// The app is created here and started in index.js, so that API tests
// (Jest + Supertest) can use the app without opening a port.
const app = express();

app.use(express.json());

// Health check: shows that the backend is running.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// M1 – Login and roles
app.use('/api/auth', authRoutes);

// Walking skeleton: return all tasks from the database.
// Access checks are added with M4 (HIVE-80).
app.get('/api/tasks', (req, res) => {
  try {
    const tasks = db
      .prepare('SELECT id, child_id, title, status FROM tasks ORDER BY id')
      .all();
    res.json(tasks);
  } catch (err) {
    console.error('Could not read tasks:', err.message);
    res.status(500).json({ error: 'Could not read tasks' });
  }
});

module.exports = app;
