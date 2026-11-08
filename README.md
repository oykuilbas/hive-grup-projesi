# Hive – AI-Assisted Child Development Platform

Hive is a web-based decision support platform where parents and linked specialists share a child's weekly schedule, tasks and observations, with a role-based AI summary that supports decisions but never makes them.

SENG 383 term project – Group 10, Section-1

## Team

| Name | GitHub |
|---|---|
| Öykü İlbaş | @oykuilbas |
| Muhammed Fatih Karagöz | @muhammedfatihkaragoz |
| Elif Beliz Özçimen | @belizozc |

## Project structure

```
client/   React frontend (Vite)
server/   Node.js + Express REST API with SQLite
docs/     SRS, SDD and PMP
```

## Requirements

- Node.js 22 (recommended; this is the version used in CI). Check with `node -v`.
- npm (comes with Node.js)

## Running the project locally

You need two terminals: one for the backend and one for the frontend.

**1. Backend**

```
cd server
npm install
npm run seed
npm start
```

The API runs at http://localhost:3001. `npm run seed` creates the SQLite database (`server/hive.db`) with synthetic sample data. Running it again resets the database to the same starting state.

**2. Frontend**

```
cd client
npm install
npm run dev
```

Open http://localhost:5173 in your browser. The page shows the tasks loaded from the backend.

## Resetting the database

The database contains only synthetic data. If the table structure changes in a later version, delete `server/hive.db` and run `npm run seed` again.

## API (walking skeleton)

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/health | Returns `{ "status": "ok" }` when the backend is running |
| GET | /api/tasks | Returns all tasks from the database |

## Workflow

1. Each piece of work is a Jira issue (project key `HIVE`).
2. Create a branch named after the issue, e.g. `HIVE-77-tasks-page`.
3. Start commit messages with the issue key, e.g. `HIVE-77: add tasks page`.
4. Open a pull request; a teammate reviews it and CI must pass before merging.

## Documentation

- [Software Requirements Specification](docs/SRS.md)
- [Software Design Document](docs/SDD.md)
- [Project Management Plan](docs/PMP.md)