const db = require('./db');

// Delete old data and add the sample task in one transaction:
// if any step fails, nothing is changed.
const seed = db.transaction(() => {
  db.exec('DELETE FROM tasks');
  db.exec("DELETE FROM sqlite_sequence WHERE name = 'tasks'");

  const insert = db.prepare(
    'INSERT INTO tasks (child_id, title, status) VALUES (?, ?, ?)'
  );
  insert.run(12, 'Read for 20 minutes', 'Pending');
});

seed();

const tasks = db.prepare('SELECT * FROM tasks').all();
console.log('Seed complete. Tasks in database:');
console.log(tasks);