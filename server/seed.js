const bcrypt = require('bcryptjs');
const db = require('./db');

// Synthetic demo data only (NFR-04). Every account uses the same password.
const DEMO_PASSWORD = 'Hive2026!';

const DEMO_USERS = {
  parent: { name: 'Ayşe Yılmaz', email: 'parent@hive.test', role: 'parent' },
  child: { name: 'Deniz Yılmaz', email: 'child@hive.test', role: 'child' },
  // Linked to the child in the M2 seed (HIVE-59).
  linkedSpecialist: { name: 'Zeynep Kaya', email: 'teacher@hive.test', role: 'specialist' },
  // Never linked to the child: used to test that access is denied (FR-M2-07).
  unlinkedSpecialist: { name: 'Murat Demir', email: 'psychologist@hive.test', role: 'specialist' },
};

// Tables are emptied children-first so that foreign keys are never broken.
// When you add a table that references users or children, delete from it here
// before the existing lines.
const TABLES_IN_DELETE_ORDER = ['tasks', 'children', 'users'];

function seedDatabase() {
  const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);

  // One transaction: if any step fails, nothing is changed.
  const run = db.transaction(() => {
    for (const table of TABLES_IN_DELETE_ORDER) {
      db.prepare(`DELETE FROM ${table}`).run();
      db.prepare('DELETE FROM sqlite_sequence WHERE name = ?').run(table);
    }

    const insertUser = db.prepare(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
    );
    const ids = {};
    for (const [key, user] of Object.entries(DEMO_USERS)) {
      ids[key] = insertUser.run(user.name, user.email, passwordHash, user.role).lastInsertRowid;
    }

    const childId = db
      .prepare('INSERT INTO children (name, birth_date, parent_id, user_id) VALUES (?, ?, ?, ?)')
      .run('Deniz Yılmaz', '2017-05-14', ids.parent, ids.child).lastInsertRowid;

    db.prepare(
  'INSERT INTO tasks (child_id, title, status, assigned_by) VALUES (?, ?, ?, ?)'
).run(
  childId,
  'Read for 20 minutes',
  'Pending',
  ids.parent
);

    return { userIds: ids, childId };
  });

  return run();
}

module.exports = { seedDatabase, DEMO_USERS, DEMO_PASSWORD };

// Run only when called directly (npm run seed), not when imported by tests.
if (require.main === module) {
  const result = seedDatabase();
  console.log('Seed complete.');
  console.log(`Demo accounts (password for all: ${DEMO_PASSWORD}):`);
  for (const user of Object.values(DEMO_USERS)) {
    console.log(`  ${user.role.padEnd(10)} ${user.email}`);
  }
  console.log(`Child record id: ${result.childId}`);
}
