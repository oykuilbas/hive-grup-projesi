const express = require('express');
const authService = require('../services/authService');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/auth/login – log in with email and password (FR-M1-01, FR-M1-02).
// The role comes from the account; the request cannot choose it (FR-M1-03).
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const result = authService.login(email, password);
  if (!result) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  res.json(result);
});

// GET /api/auth/me – the logged-in user's name and role (SDD Section 4).
// The frontend uses it to restore the session after a page refresh.
router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

module.exports = router;
