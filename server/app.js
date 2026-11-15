const express = require('express');
const assignedTaskRoutes = require('./routes/assignedTaskRoutes');
const taskCompletionRoutes = require('./routes/taskCompletionRoutes');
const eventRoutes = require('./routes/eventRoutes');
const db = require('./db');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { requireAuth } = require('./middleware/authMiddleware');

const { createM2Router } = require('./routes/m2Routes');

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
app.use('/api/children', taskRoutes);
app.use('/api/tasks', taskCompletionRoutes);
app.use('/api/tasks', assignedTaskRoutes);
app.use('/api/children', eventRoutes);

// M2 – child listing and parent-managed specialist links.
app.use('/api', createM2Router({ db, requireAuth }));

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
