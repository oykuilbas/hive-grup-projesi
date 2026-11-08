
const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check: shows that the backend is running.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Walking skeleton: return all tasks from the database.
// Login and access checks are added in Sprint 2 (M1, M2).
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
