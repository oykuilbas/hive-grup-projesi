const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/authMiddleware');
const canAccessChild = require('../middleware/canAccessChild');

const router = express.Router();

// M3 – Create an event
router.post('/:childId/events', requireAuth, canAccessChild, (req, res) => {
  try {
    if (!['parent', 'specialist'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Only parents and specialists can create events'
      });
    }

    const { title, event_date, start_time, end_time } = req.body;

    if (!title || !event_date || !start_time || !end_time) {
      return res.status(400).json({
        error: 'All event fields are required'
      });
    }

    if (end_time <= start_time) {
      return res.status(400).json({
        error: 'End time must be after start time'
      });
    }

    const result = db.prepare(`
      INSERT INTO events
      (child_id, title, event_date, start_time, end_time, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      req.params.childId,
      title,
      event_date,
      start_time,
      end_time,
      req.user.id
    );

    res.status(201).json({
      id: result.lastInsertRowid,
      child_id: Number(req.params.childId),
      title,
      event_date,
      start_time,
      end_time,
      created_by: req.user.id
    });
  } catch (err) {
    console.error('Could not create event:', err.message);
    res.status(500).json({ error: 'Could not create event' });
  }
});
// M3 – List events for a child
router.get('/:childId/events', requireAuth, canAccessChild, (req, res) => {
  try {
    const { weekStart } = req.query;

if (!weekStart || !/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
  return res.status(400).json({
    error: 'Valid weekStart is required (YYYY-MM-DD)'
  });
}

const start = new Date(`${weekStart}T00:00:00Z`);

if (
  Number.isNaN(start.getTime()) ||
  start.toISOString().slice(0, 10) !== weekStart ||
  start.getUTCDay() !== 1
) {
  return res.status(400).json({
    error: 'weekStart must be a valid Monday'
  });
}

const end = new Date(start);
end.setUTCDate(end.getUTCDate() + 7);

const weekEnd = end.toISOString().slice(0, 10);

const events = db.prepare(`
  SELECT id, child_id, title, event_date,
         start_time, end_time, created_by
  FROM events
  WHERE child_id = ?
    AND event_date >= ?
    AND event_date < ?
  ORDER BY event_date, start_time
`).all(req.params.childId, weekStart, weekEnd);
    res.json(events);
  } catch (err) {
    console.error('Could not list events:', err.message);
    res.status(500).json({
      error: 'Could not list events'
    });
  }
});
module.exports = router;