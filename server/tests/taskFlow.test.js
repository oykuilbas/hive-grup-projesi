
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

describe('HIVE-87 – Task assignment and completion flow', () => {
  test('Parent assigns a task and child completes it', async () => {
    const parentToken = await tokenFor('parent');
    const childToken = await tokenFor('child');

    // 1. Parent creates a task
    const created = await request(app)
      .post(`/api/children/${ids.childId}/tasks`)
      .set('Authorization', `Bearer ${parentToken}`)
      .send({
        title: 'Reading practice',
        description: 'Read for 20 minutes',
        development_area: 'Language',
        due_date: '2026-11-20'
      });

    expect(created.status).toBe(201);
    expect(created.body.status).toBe('Pending');

    const taskId = created.body.id;

    // 2. Child sees the assigned task
    const childTasks = await request(app)
      .get(`/api/children/${ids.childId}/tasks`)
      .set('Authorization', `Bearer ${childToken}`);

    expect(childTasks.status).toBe(200);
    expect(
      childTasks.body.some(task => task.id === taskId)
    ).toBe(true);

    // 3. Child completes the task
    const completed = await request(app)
      .patch(`/api/tasks/${taskId}/complete`)
      .set('Authorization', `Bearer ${childToken}`);

    expect(completed.status).toBe(200);
    expect(completed.body.status).toBe('Completed');
    expect(completed.body.completed_at).not.toBeNull();

    // 4. Parent sees the updated status
    const parentTasks = await request(app)
      .get(`/api/children/${ids.childId}/tasks`)
      .set('Authorization', `Bearer ${parentToken}`);

    expect(parentTasks.status).toBe(200);

    const updatedTask = parentTasks.body.find(
      task => task.id === taskId
    );

    expect(updatedTask).toBeDefined();
    expect(updatedTask.status).toBe('Completed');
    expect(updatedTask.completed_at).not.toBeNull();
  });
});
