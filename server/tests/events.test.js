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
}

describe('HIVE-67 - Event endpoints', () => {
  test('Parent can create an event', async () => {
    const token = await tokenFor('parent');

    const response = await request(app)
      .post(`/api/children/${ids.childId}/events`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Math lesson',
        event_date: '2026-11-16',
        start_time: '14:00',
        end_time: '15:00'
      });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Math lesson');
    expect(response.body.child_id).toBe(ids.childId);
  });
  test('Parent can list events for their child', async () => {
  const token = await tokenFor('parent');

  const response = await request(app)
    .get(`/api/children/${ids.childId}/events?weekStart=2026-11-16`)
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
});
test('Unauthenticated users cannot access events', async () => {
  const response = await request(app)
    .get(`/api/children/${ids.childId}/events`);

  expect(response.status).toBe(401);
});
test('Cannot create an event without a title', async () => {
  const token = await tokenFor('parent');

  const response = await request(app)
    .post(`/api/children/${ids.childId}/events`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      event_date: '2026-11-16',
      start_time: '14:00',
      end_time: '15:00'
    });

  expect(response.status).toBe(400);
});
test('End time must be after start time', async () => {
  const token = await tokenFor('parent');

  const response = await request(app)
    .post(`/api/children/${ids.childId}/events`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Math lesson',
      event_date: '2026-11-16',
      start_time: '15:00',
      end_time: '14:00'
    });

  expect(response.status).toBe(400);
});
test('Only events from the selected week are returned', async () => {
  const token = await tokenFor('parent');

  for (const event_date of ['2026-11-16', '2026-11-23']) {
    const response = await request(app)
      .post(`/api/children/${ids.childId}/events`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Math lesson',
        event_date,
        start_time: '14:00',
        end_time: '15:00'
      });

    expect(response.status).toBe(201);
  }

  const response = await request(app)
    .get(`/api/children/${ids.childId}/events?weekStart=2026-11-16`)
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body).toHaveLength(1);
  expect(response.body[0].event_date).toBe('2026-11-16');
});
test('Rejects invalid event date', async () => {
  const token = await tokenFor('parent');

  const response = await request(app)
    .post(`/api/children/${ids.childId}/events`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Math lesson',
      event_date: '2026-02-30',
      start_time: '14:00',
      end_time: '15:00'
    });

  expect(response.status).toBe(400);
});
test('Rejects invalid time format', async () => {
  const token = await tokenFor('parent');

  const response = await request(app)
    .post(`/api/children/${ids.childId}/events`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Math lesson',
      event_date: '2026-11-16',
      start_time: '25:00',
      end_time: '26:00'
    });

  expect(response.status).toBe(400);
});

test('Linked specialist can create an event', async () => {
  const token = await tokenFor('linkedSpecialist');

  const response = await request(app)
    .post(`/api/children/${ids.childId}/events`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Speech therapy',
      event_date: '2026-11-16',
      start_time: '10:00',
      end_time: '11:00'
    });

  expect(response.status).toBe(201);
});

test('Child can view their own weekly schedule', async () => {
  const token = await tokenFor('child');

  const response = await request(app)
    .get(`/api/children/${ids.childId}/events?weekStart=2026-11-16`)
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
});

test('Child cannot create events', async () => {
  const token = await tokenFor('child');

  const response = await request(app)
    .post(`/api/children/${ids.childId}/events`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Unauthorized event',
      event_date: '2026-11-16',
      start_time: '10:00',
      end_time: '11:00'
    });

  expect(response.status).toBe(403);
});

});