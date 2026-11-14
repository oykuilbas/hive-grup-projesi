// M1 API tests: login, token check and role check (HIVE-57).
// Every test file uses its own in-memory database, so tests never touch hive.db.
process.env.DB_PATH = ':memory:';

const express = require('express');
const jwt = require('jsonwebtoken');
const request = require('supertest');

const db = require('../db');
const app = require('../app');
const { seedDatabase, DEMO_USERS, DEMO_PASSWORD } = require('../seed');
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const { JWT_SECRET } = require('../config');

beforeAll(() => {
  seedDatabase();
});

function login(email, password = DEMO_PASSWORD) {
  return request(app).post('/api/auth/login').send({ email, password });
}

async function tokenFor(email) {
  const res = await login(email);
  return res.body.token;
}

describe('POST /api/auth/login', () => {
  test('logs in with a correct email and password (FR-M1-01)', async () => {
    const res = await login(DEMO_USERS.parent.email);

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user).toEqual({
      id: expect.any(Number),
      name: DEMO_USERS.parent.name,
      email: DEMO_USERS.parent.email,
      role: 'parent',
    });
  });

  test('takes the role from the account, not from the request (FR-M1-03)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: DEMO_USERS.child.email, password: DEMO_PASSWORD, role: 'parent' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('child');
  });

  test('accepts the email in any letter case and with spaces around it', async () => {
    const res = await login('  PARENT@hive.test ');
    expect(res.status).toBe(200);
  });

  test('rejects a wrong password with 401 (FR-M1-02)', async () => {
    const res = await login(DEMO_USERS.parent.email, 'wrong-password');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password.');
    expect(res.body.token).toBeUndefined();
  });

  test('gives the same answer for an unknown email, so accounts cannot be guessed', async () => {
    const unknown = await login('nobody@hive.test');
    const wrongPassword = await login(DEMO_USERS.parent.email, 'wrong-password');

    expect(unknown.status).toBe(401);
    expect(unknown.body).toEqual(wrongPassword.body);
  });

  test.each([
    ['no body', undefined],
    ['missing password', { email: 'parent@hive.test' }],
    ['missing email', { password: DEMO_PASSWORD }],
    ['empty email', { email: '   ', password: DEMO_PASSWORD }],
    ['email is not text', { email: 123, password: DEMO_PASSWORD }],
  ])('returns 400 for %s', async (_case, body) => {
    const res = await request(app).post('/api/auth/login').send(body);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email and password are required.');
  });

  test('issues a token that expires after 1 hour and holds no password (NFR-02)', async () => {
    const token = await tokenFor(DEMO_USERS.parent.email);
    const payload = jwt.verify(token, JWT_SECRET);

    expect(payload.role).toBe('parent');
    expect(payload.exp - payload.iat).toBe(60 * 60);
    expect(Object.keys(payload).sort()).toEqual(['exp', 'iat', 'role', 'sub']);
  });
});

describe('Password storage (NFR-01)', () => {
  test('stores only bcrypt hashes, never the plain password', () => {
    const users = db.prepare('SELECT password_hash FROM users').all();

    expect(users.length).toBeGreaterThan(0);
    for (const { password_hash } of users) {
      expect(password_hash).toMatch(/^\$2[aby]\$/);
      expect(password_hash).not.toContain(DEMO_PASSWORD);
    }
  });
});

describe('GET /api/auth/me (requireAuth, FR-M1-04)', () => {
  test('returns the logged-in parent', async () => {
    const token = await tokenFor(DEMO_USERS.parent.email);
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: expect.any(Number), name: DEMO_USERS.parent.name, role: 'parent' });
  });

  test("returns the child's own child record id", async () => {
    const token = await tokenFor(DEMO_USERS.child.email);
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    const child = db.prepare('SELECT id FROM children WHERE user_id = ?').get(res.body.id);
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('child');
    expect(res.body.childId).toBe(child.id);
  });

  test('returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Login required.');
  });

  test.each([
    ['a header without "Bearer"', (token) => token],
    ['a malformed token', () => 'Bearer not-a-real-token'],
    ['a token signed with another secret', () => `Bearer ${jwt.sign({ sub: 1, role: 'parent' }, 'other-secret')}`],
    ['an expired token', () => `Bearer ${jwt.sign({ sub: 1, role: 'parent' }, JWT_SECRET, { expiresIn: -10 })}`],
    ['a token of a user that does not exist', () => `Bearer ${jwt.sign({ sub: 9999, role: 'parent' }, JWT_SECRET)}`],
  ])('returns 401 for %s', async (_case, makeHeader) => {
    const token = await tokenFor(DEMO_USERS.parent.email);
    const res = await request(app).get('/api/auth/me').set('Authorization', makeHeader(token));

    expect(res.status).toBe(401);
  });

  test('uses the role from the database, not a role written into a forged token', async () => {
    const child = db.prepare('SELECT id FROM users WHERE email = ?').get(DEMO_USERS.child.email);
    const forged = jwt.sign({ sub: child.id, role: 'parent' }, JWT_SECRET);
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${forged}`);

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('child');
  });
});

describe('requireRole (FR-M1-06)', () => {
  // A small app with one parent-only route, used only in these tests.
  const roleApp = express();
  roleApp.get('/parent-only', requireAuth, requireRole('parent'), (req, res) => res.json({ ok: true }));
  roleApp.get('/staff-only', requireAuth, requireRole('parent', 'specialist'), (req, res) => res.json({ ok: true }));

  test.each([
    ['parent', '/parent-only', 200],
    ['linkedSpecialist', '/parent-only', 403],
    ['child', '/parent-only', 403],
    ['parent', '/staff-only', 200],
    ['linkedSpecialist', '/staff-only', 200],
    ['child', '/staff-only', 403],
  ])('%s calling %s gets %i', async (userKey, path, expected) => {
    const token = await tokenFor(DEMO_USERS[userKey].email);
    const res = await request(roleApp).get(path).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(expected);
    if (expected === 403) {
      expect(res.body.error).toBe('You do not have permission to do this.');
    }
  });

  test('returns 401, not 403, when nobody is logged in', async () => {
    const res = await request(roleApp).get('/parent-only');
    expect(res.status).toBe(401);
  });
});
