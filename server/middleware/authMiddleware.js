const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET } = require('../config');

// requireAuth – every protected route uses this first (FR-M1-04).
//
// Reads "Authorization: Bearer <token>", verifies it and sets req.user:
//   { id, name, role }            for parent and specialist
//   { id, name, role, childId }   for child (childId = children.id of their own record)
//
// The user is read from the database on every request, so a deleted account
// cannot keep using an old token. Responds 401 when the token is missing,
// invalid or expired.
function requireAuth(req, res, next) {
  const header = req.get('Authorization') || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Login required.' });
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Session is invalid or has expired. Please log in again.' });
  }

  const user = db.prepare('SELECT id, name, role FROM users WHERE id = ?').get(payload.sub);
  if (!user) {
    return res.status(401).json({ error: 'Session is invalid or has expired. Please log in again.' });
  }

  req.user = { id: user.id, name: user.name, role: user.role };

  if (user.role === 'child') {
    const child = db.prepare('SELECT id FROM children WHERE user_id = ?').get(user.id);
    req.user.childId = child ? child.id : null;
  }

  next();
}

// requireRole('parent'), requireRole('parent', 'specialist') …
// Use after requireAuth. Responds 403 when the user's role is not in the list,
// even if the request was sent without the user interface (FR-M1-06).
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to do this.' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
