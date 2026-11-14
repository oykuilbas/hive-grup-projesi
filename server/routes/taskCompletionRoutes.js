const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();



// HIVE-81 – Complete a task
router.patch('/:taskId/complete', requireAuth, (req, res) => {
  try {
    const taskId = Number(req.params.taskId);

    if (!Number.isSafeInteger(taskId) || taskId <= 0) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    if (req.user.role !== 'child') {
      return res.status(403).json({ error: 'Only children can complete tasks' });
    }

    const task = db.prepare(`
      SELECT tasks.*, children.user_id
      FROM tasks
      JOIN children ON tasks.child_id = children.id
      WHERE tasks.id = ?
    `).get(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    db.prepare(`
      UPDATE tasks
      SET status = 'Completed',
          completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(taskId);

    const updatedTask = db.prepare(
      'SELECT * FROM tasks WHERE id = ?'
    ).get(taskId);

    res.json(updatedTask);

  } catch (err) {
    console.error('Could not complete task:', err.message);
    res.status(500).json({ error: 'Could not complete task' });
  }
});

module.exports = router;