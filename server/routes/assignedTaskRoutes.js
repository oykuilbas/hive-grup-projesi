const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requireAuth);

// M4 - List tasks assigned by the logged-in user
router.get('/assigned', (req, res) => {
  if (!['parent', 'specialist'].includes(req.user.role)) {
    return res.status(403).json({
      error: 'Only parents and specialists can view assigned tasks'
    });
  }

  try {
    const tasks = db.prepare(`
      SELECT
        id,
        child_id,
        title,
        description,
        development_area,
        due_date,
        assigned_by,
        status,
        completed_at
      FROM tasks
      WHERE assigned_by = ?
      ORDER BY id DESC
    `).all(req.user.id);

    return res.json(tasks);
  } catch (err) {
    console.error('Could not list assigned tasks:', err.message);

    return res.status(500).json({
      error: 'Could not list assigned tasks'
    });
  }
});

module.exports = router;