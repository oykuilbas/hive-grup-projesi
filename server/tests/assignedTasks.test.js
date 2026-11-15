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

describe('HIVE-82 – Assigned tasks endpoint', () => {

  test('Parent can view their assigned tasks', async () => {
    const token = await tokenFor('parent');

    const create = await request(app)
      .post(`/api/children/${ids.childId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Read a book',
        description: 'Read for 15 minutes',
        development_area: 'Cognitive',
        due_date: '2026-11-20'
      });

    expect(create.status).toBe(201);

    const response = await request(app)
      .get('/api/tasks/assigned')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Read a book',
          assigned_by: ids.userIds.parent
        })
      ])
    );
  });

  test('Specialist can view their assigned tasks', async () => {
    const token = await tokenFor('linkedSpecialist');

    const create = await request(app)
      .post(`/api/children/${ids.childId}/tasks`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Speech exercise',
        development_area: 'Language'
      });

    expect(create.status).toBe(201);

    const response = await request(app)
      .get('/api/tasks/assigned')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'Speech exercise',
          assigned_by: ids.userIds.linkedSpecialist
        })
      ])
    );
  });

  test('Child cannot access assigned tasks', async () => {
    const token = await tokenFor('child');

    const response = await request(app)
      .get('/api/tasks/assigned')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  test('User cannot view tasks assigned by another user', async () => {
    const parentToken = await tokenFor('parent');
    const specialistToken = await tokenFor('linkedSpecialist');

    const create = await request(app)
      .post(`/api/children/${ids.childId}/tasks`)
      .set('Authorization', `Bearer ${parentToken}`)
      .send({ title: 'Parent private assignment' });

    expect(create.status).toBe(201);

    const response = await request(app)
      .get('/api/tasks/assigned')
      .set('Authorization', `Bearer ${specialistToken}`);

    expect(response.status).toBe(200);
    expect(response.body.some(
      task => task.title === 'Parent private assignment'
    )).toBe(false);
  });

  test('Unauthenticated user cannot access assigned tasks', async () => {
    const response = await request(app)
      .get('/api/tasks/assigned');

    expect(response.status).toBe(401);
  });

});