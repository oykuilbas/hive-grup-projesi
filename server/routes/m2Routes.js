const express = require('express');
const { parseId, hasChildSchema } = require('../middleware/canAccessChild');

const SPECIALIST_TYPES = new Set(['teacher', 'psychologist', 'doctor', 'special education teacher', 'coach']);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function hasUserSchema(db) {
  const table = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'users'").get();
  if (!table) return false;
  const columns = db.pragma('table_info(users)').map((column) => column.name);
  return ['id', 'name', 'email', 'role'].every((name) => columns.includes(name));
}

function createM2Router({ db, requireAuth }) {
  const router = express.Router();
  // Let M3/M4 child routes pass through this router untouched.
  router.use((req, res, next) => {
    if (!/^\/children(?:\/[^/]+\/links(?:\/[^/]+)?)?\/?$/.test(req.path)) return next('router');
    next();
  });
  router.use(requireAuth);
  router.use((req, res, next) => {
    if (!req.user || !Number.isSafeInteger(Number(req.user.id)) || Number(req.user.id) <= 0) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!hasChildSchema(db) || !hasUserSchema(db)) {
      return res.status(503).json({ error: 'Users and children schema is not available' });
    }
    next();
  });

  const handle = (handler) => (req, res, next) => {
    try { handler(req, res); } catch (error) { next(error); }
  };

  router.get('/children', handle((req, res) => {
    const userId = Number(req.user.id);
    let children;
    if (req.user.role === 'parent') {
      children = db.prepare('SELECT id, name FROM children WHERE parent_id = ? ORDER BY name, id').all(userId);
    } else if (req.user.role === 'specialist') {
      children = db.prepare(`SELECT c.id, c.name FROM children c
        JOIN links l ON l.child_id = c.id WHERE l.specialist_id = ? ORDER BY c.name, c.id`).all(userId);
    } else if (req.user.role === 'child') {
      children = db.prepare('SELECT id, name FROM children WHERE user_id = ? ORDER BY name, id').all(userId);
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(children);
  }));

  router.use('/children/:childId/links', (req, res, next) => {
    const childId = parseId(req.params.childId);
    if (!childId) return res.status(400).json({ error: 'Invalid child ID' });
    if (req.user.role !== 'parent') return res.status(403).json({ error: 'Access denied' });
    const child = db.prepare('SELECT id FROM children WHERE id = ? AND parent_id = ?')
      .get(childId, Number(req.user.id));
    if (!child) return res.status(403).json({ error: 'Access denied' });
    req.childId = childId;
    next();
  });

  router.get('/children/:childId/links', handle((req, res) => {
    const links = db.prepare(`SELECT l.id, l.child_id, l.specialist_id, l.specialist_type,
      l.created_at, u.name, u.email FROM links l JOIN users u ON u.id = l.specialist_id
      WHERE l.child_id = ? ORDER BY u.name, u.id`).all(req.childId);
    res.json(links);
  }));

  router.post('/children/:childId/links', handle((req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const type = typeof req.body?.specialist_type === 'string' ? req.body.specialist_type.trim().toLowerCase() : '';
    if (email.length > 254 || !EMAIL_PATTERN.test(email) || !SPECIALIST_TYPES.has(type)) {
      return res.status(400).json({ error: 'Valid specialist email and specialist_type are required' });
    }
    const specialist = db.prepare('SELECT id, name, email FROM users WHERE lower(email) = ? AND role = ?')
      .get(email, 'specialist');
    if (!specialist) return res.status(404).json({ error: 'Registered specialist not found' });
    const result = db.prepare(`INSERT INTO links (child_id, specialist_id, specialist_type)
      VALUES (?, ?, ?) ON CONFLICT(child_id, specialist_id) DO NOTHING`)
      .run(req.childId, specialist.id, type);
    if (!result.changes) return res.status(409).json({ error: 'Specialist is already linked to this child' });
    const link = db.prepare('SELECT id, child_id, specialist_id, specialist_type, created_at FROM links WHERE id = ?')
      .get(result.lastInsertRowid);
    res.status(201).json({ ...link, name: specialist.name, email: specialist.email });
  }));

  router.delete('/children/:childId/links/:specialistId', handle((req, res) => {
    const specialistId = parseId(req.params.specialistId);
    if (!specialistId) return res.status(400).json({ error: 'Invalid specialist ID' });
    const result = db.prepare('DELETE FROM links WHERE child_id = ? AND specialist_id = ?')
      .run(req.childId, specialistId);
    if (!result.changes) return res.status(404).json({ error: 'Link not found' });
    res.status(204).end();
  }));

  return router;
}

module.exports = { createM2Router };
