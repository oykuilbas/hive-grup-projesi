const path = require('path');
const Database = require('better-sqlite3');

// The database file is created in the server folder.
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'hive.db');

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

// Skeleton version of the tasks table.
// The full table (area, due date, etc.) comes in HIVE-79.
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id INTEGER NOT NULL,
    title    TEXT    NOT NULL,
    status   TEXT    NOT NULL DEFAULT 'Pending'
  )
`);

module.exports = db;
