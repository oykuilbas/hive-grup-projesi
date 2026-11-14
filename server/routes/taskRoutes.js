const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/authMiddleware');
const canAccessChild = require('../middleware/canAccessChild');

const router = express.Router();

router.use(requireAuth);
router.use('/:childId/tasks', canAccessChild);
// M4 – List tasks for a child
router.get('/:childId/tasks', (req, res) => {
  try {
    const tasks = db.prepare(`
      SELECT id, child_id, title, description,
             development_area, due_date, assigned_by,
             status, completed_at
      FROM tasks
      WHERE child_id = ?
      ORDER BY id
    `).all(req.params.childId);

    res.json(tasks);
  } catch (err) {
    console.error('Could not list tasks:', err.message);
    res.status(500).json({ error: 'Could not list tasks' });
  }
});
// M4 – Create a task for a child
router.post('/:childId/tasks', (req, res) => {
  try {
    const childId = Number(req.params.childId);
    if (!['parent', 'specialist'].includes(req.user.role?.toLowerCase())) {
  return res.status(403).json({
    error: 'Only parents and specialists can create tasks'
  });
}
    const { title, description, development_area, due_date } = req.body;

    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = db.prepare(`
      INSERT INTO tasks
        (child_id, title, description, development_area, due_date, assigned_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      childId,
      title.trim(),
      description ?? null,
      development_area ?? null,
      due_date ?? null,
      req.user.id
    );

    const task = db.prepare(
      'SELECT * FROM tasks WHERE id = ?'
    ).get(result.lastInsertRowid);

    res.status(201).json(task);
  } catch (err) {
    console.error('Could not create task:', err.message);
    res.status(500).json({ error: 'Could not create task' });
  }
});
module.exports = router;