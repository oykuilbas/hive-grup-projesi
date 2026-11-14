// M2 API tests use M1's real JWT middleware and an isolated SQLite database.
process.env.DB_PATH = ':memory:';

const request = require('supertest');
const db = require('../db');
const app = require('../app');
const { seedDatabase, DEMO_USERS, DEMO_PASSWORD } = require('../seed');
const { requireAuth } = require('../middleware/authMiddleware');
const canAccessChild = require('../middleware/canAccessChild');

app.get('/api/children/:childId/m2-test-resource', requireAuth, canAccessChild,
  (req, res) => res.json({ childId: Number(req.params.childId) }));

let ids;
beforeEach(() => { ids = seedDatabase(); });
afterAll(() => db.close());

async function tokenFor(user) {
  const response = await request(app).post('/api/auth/login')
    .send({ email: DEMO_USERS[user].email, password: DEMO_PASSWORD });
  expect(response.status).toBe(200);
  return response.body.token;
}

test('unlinked specialist gets 403; unlink immediately revokes a linked specialist', async () => {
  const parent = await tokenFor('parent');
  const linked = await tokenFor('linkedSpecialist');
  const unlinked = await tokenFor('unlinkedSpecialist');
  const path = `/api/children/${ids.childId}/m2-test-resource`;

  expect((await request(app).get(path).set('Authorization', `Bearer ${unlinked}`)).status).toBe(403);
  expect((await request(app).get(path).set('Authorization', `Bearer ${linked}`)).status).toBe(200);
  expect((await request(app).delete(`/api/children/${ids.childId}/links/${ids.userIds.linkedSpecialist}`)
    .set('Authorization', `Bearer ${parent}`)).status).toBe(204);
  expect((await request(app).get(path).set('Authorization', `Bearer ${linked}`)).status).toBe(403);
});

test('M2 routes require authentication and validate child IDs', async () => {
  const linked = await tokenFor('linkedSpecialist');
  expect((await request(app).get('/api/children')).status).toBe(401);
  expect((await request(app).get(`/api/children/${ids.childId}/links`)).status).toBe(401);
  expect((await request(app).get(`/api/children/no/links`).set('Authorization', `Bearer ${linked}`)).status).toBe(400);
  expect((await request(app).get(`/api/children/no/m2-test-resource`).set('Authorization', `Bearer ${linked}`)).status).toBe(400);
});

test('children listing follows the parent, specialist and child accounts', async () => {
  for (const [role, expected] of [
    ['parent', [ids.childId]], ['linkedSpecialist', [ids.childId]],
    ['unlinkedSpecialist', []], ['child', [ids.childId]],
  ]) {
    const token = await tokenFor(role);
    const response = await request(app).get('/api/children').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.map((child) => child.id)).toEqual(expected);
  }
});

test('only owning parent can list, add or remove links', async () => {
  const parent = await tokenFor('parent');
  const specialist = await tokenFor('linkedSpecialist');
  const child = await tokenFor('child');
  const path = `/api/children/${ids.childId}/links`;

  expect((await request(app).get(path).set('Authorization', `Bearer ${parent}`)).body).toHaveLength(1);
  expect((await request(app).get(path).set('Authorization', `Bearer ${specialist}`)).status).toBe(403);
  expect((await request(app).get(path).set('Authorization', `Bearer ${child}`)).status).toBe(403);

  const body = { email: DEMO_USERS.unlinkedSpecialist.email, specialist_type: 'doctor' };
  expect((await request(app).post(path).set('Authorization', `Bearer ${specialist}`).send(body)).status).toBe(403);
  expect((await request(app).post(path).set('Authorization', `Bearer ${parent}`)
    .send({ ...body, email: 'not-an-email' })).status).toBe(400);
  expect((await request(app).post(path).set('Authorization', `Bearer ${parent}`).send(body)).status).toBe(201);
  expect((await request(app).post(path).set('Authorization', `Bearer ${parent}`).send(body)).status).toBe(409);
  expect((await request(app).delete(`${path}/${ids.userIds.unlinkedSpecialist}`)
    .set('Authorization', `Bearer ${parent}`)).status).toBe(204);
  expect((await request(app).delete(`${path}/${ids.userIds.unlinkedSpecialist}`)
    .set('Authorization', `Bearer ${parent}`)).status).toBe(404);
});

test('re-seeding leaves one teacher link and no link for the other specialist', () => {
  seedDatabase();
  expect(db.prepare('SELECT specialist_id, specialist_type FROM links').all()).toEqual([
    { specialist_id: ids.userIds.linkedSpecialist, specialist_type: 'teacher' },
  ]);
});
