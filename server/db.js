const path = require('path');
const Database = require('better-sqlite3');

// The database file is created in the server folder.
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'hive.db');

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

// Tables are created in dependency order: a table is created only after
// every table it references (SDD Section 3).

// M1 – One table for all roles; the role comes from the account (FR-M1-03).
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL CHECK (role IN ('parent', 'specialist', 'child'))
  )
`);

// M1, M2 – parent_id is the parent's user; user_id is the child's own account.
db.exec(`
  CREATE TABLE IF NOT EXISTS children (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    birth_date TEXT,
    parent_id  INTEGER NOT NULL REFERENCES users(id),
    user_id    INTEGER UNIQUE REFERENCES users(id)
  )
`);

// M2 – Existing preliminary links tables are retained, never rebuilt here.
db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id INTEGER NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    specialist_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialist_type TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(child_id, specialist_id)
  )
`);

// Add the type to preliminary databases without deleting any existing links.
const linkColumns = db.pragma('table_info(links)');
if (!linkColumns.some((column) => column.name === 'specialist_type')) {
  db.exec('ALTER TABLE links ADD COLUMN specialist_type TEXT');
}

// M4 - Tasks table (HIVE-79)

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id         INTEGER NOT NULL REFERENCES children(id),
    title            TEXT NOT NULL,
    description      TEXT,
    development_area TEXT,
    due_date         TEXT,
    assigned_by      INTEGER NOT NULL REFERENCES users(id),
    status           TEXT NOT NULL DEFAULT 'Pending'
                     CHECK (status IN ('Pending', 'Completed')),
    completed_at     TEXT
  )
`);
  

module.exports = db;
