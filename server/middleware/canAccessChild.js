
const db = require('../db');

function parseId(value) {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
}

function hasChildSchema(database) {
  const table = database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'children'").get();
  if (!table) return false;
  const columns = database.pragma('table_info(children)').map((column) => column.name);
  return ['id', 'parent_id', 'user_id'].every((name) => columns.includes(name));
}

// M3/M4 use this after requireAuth on routes containing :childId.
function createCanAccessChild(database, { allowChild = false } = {}) {
  return (req, res, next) => {
    if (!req.user || !Number.isSafeInteger(Number(req.user.id)) || Number(req.user.id) <= 0) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const childId = parseId(req.params.childId);
    if (!childId) return res.status(400).json({ error: 'Invalid child ID' });
    if (!hasChildSchema(database)) return res.status(503).json({ error: 'Children schema is not available' });

    try {
      const child = database.prepare('SELECT id, parent_id, user_id FROM children WHERE id = ?').get(childId);
      if (!child) return res.status(404).json({ error: 'Child not found' });

      const userId = Number(req.user.id);
      if (req.user.role === 'parent' && child.parent_id === userId) return next();
      if (allowChild && req.user.role === 'child' && child.user_id === userId) return next();
      if (req.user.role === 'specialist') {
        const link = database.prepare('SELECT 1 FROM links WHERE child_id = ? AND specialist_id = ?')
          .get(childId, userId);
        if (link) return next();
      }
      return res.status(403).json({ error: 'Access denied' });
    } catch (error) {
      return next(error);
    }
  };
}

const canAccessChild = createCanAccessChild(db);
canAccessChild.allowChild = createCanAccessChild(db, { allowChild: true });

module.exports = canAccessChild;
module.exports.createCanAccessChild = createCanAccessChild;
module.exports.parseId = parseId;
module.exports.hasChildSchema = hasChildSchema;
