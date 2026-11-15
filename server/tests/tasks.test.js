process.env.DB_PATH = ':memory:';

const request = require('supertest');
const db = require('../db');
const app = require('../app');
const { seedDatabase, DEMO_USERS, DEMO_PASSWORD } = require('../seed');

let ids;

beforeEach(() => {
  ids = seedDatabase();
});

afterAll(() => db.close());

async function tokenFor(user) {
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: DEMO_USERS[user].email,
      password: DEMO_PASSWORD
    });

  expect(response.status).toBe(200);
  return response.body.token;
}describe('HIVE-80 – Task endpoints', () => {
  test('Parent can list tasks for their child', async () => {
    const token = await tokenFor('parent');

    const response = await request(app)
      .get(`/api/children/${ids.childId}/tasks`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
 test('Parent can create a task for their child', async () => {
  const token = await tokenFor('parent');

  const response = await request(app)
    .post(`/api/children/${ids.childId}/tasks`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Reading practice',
      description: 'Read for 20 minutes',
      development_area: 'Language',
      due_date: '2026-11-20'
    });

  expect(response.status).toBe(201);
  expect(response.body.title).toBe('Reading practice');
  expect(response.body.status).toBe('Pending');
  expect(response.body.child_id).toBe(ids.childId)});
test('Unauthenticated users cannot access tasks', async () => {
  const response = await request(app)
    .get(`/api/children/${ids.childId}/tasks`);

  expect(response.status).toBe(401);
});
test('Cannot create a task without a title', async () => {
  const token = await tokenFor('parent');

  const response = await request(app)
    .post(`/api/children/${ids.childId}/tasks`)
    .set('Authorization', `Bearer ${token}`)
    .send({ description: 'Task without title' });

  expect(response.status).toBe(400);
});
test('Child cannot create a task', async () => {
  const token = await tokenFor('child');

  const response = await request(app)
    .post(`/api/children/${ids.childId}/tasks`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Unauthorized task'
    });

  expect(response.status).toBe(403);
});
test('Child can complete their own task', async () => {
  const parentToken = await tokenFor('parent');

  const created = await request(app)
    .post(`/api/children/${ids.childId}/tasks`)
    .set('Authorization', `Bearer ${parentToken}`)
    .send({ title: 'Complete homework' });

  expect(created.status).toBe(201);

  const childToken = await tokenFor('child');

  const response = await request(app)
    .patch(`/api/tasks/${created.body.id}/complete`)
    .set('Authorization', `Bearer ${childToken}`);

  expect(response.status).toBe(200);
  expect(response.body.status).toBe('Completed');
  expect(response.body.completed_at).not.toBeNull();
});

test('Parent cannot complete a task', async () => {
  const parentToken = await tokenFor('parent');

  const created = await request(app)
    .post(`/api/children/${ids.childId}/tasks`)
    .set('Authorization', `Bearer ${parentToken}`)
    .send({ title: 'Test task' });

  const response = await request(app)
    .patch(`/api/tasks/${created.body.id}/complete`)
    .set('Authorization', `Bearer ${parentToken}`);

  expect(response.status).toBe(403);
});
});