const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');

// Returns { token, user } for a correct email and password, otherwise null.
// The same null is returned for an unknown email and a wrong password, so the
// response does not reveal which accounts exist (FR-M1-02).
function login(email, password) {
  const user = db
    .prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = ?')
    .get(email.trim().toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return null;
  }

  // The token holds only the user id and role: no password, no child data (NFR-02).
  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

module.exports = { login };
