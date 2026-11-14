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

Open http://localhost:5173 in your browser and log in with one of the demo accounts below. Each role is taken to its own home page (`/parent`, `/specialist` or `/child`) and cannot open the pages of the other roles.

## Demo accounts

`npm run seed` creates these synthetic accounts. The password for all of them is `Hive2026!`.

| Role | Email | Notes |
|---|---|---|
| Parent | parent@hive.test | Parent of the child Deniz Yılmaz |
| Child | child@hive.test | Deniz Yılmaz's own account |
| Specialist | teacher@hive.test | Linked to the child (the link is added by the M2 seed) |
| Specialist | psychologist@hive.test | Not linked to the child; used to test that access is denied |

## Resetting the database

The database contains only synthetic data. If the table structure changes in a later version, delete `server/hive.db` and run `npm run seed` again.

## Configuration (optional)

The backend runs without any configuration. To override the defaults, copy `server/.env.example` to `server/.env` and edit it. `.env` is ignored by Git and must never be committed.

| Variable | Default | Purpose |
|---|---|---|
| `JWT_SECRET` | a fixed development secret | Secret used to sign login tokens |
| `PORT` | `3001` | Port of the API |

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/health | Returns `{ "status": "ok" }` when the backend is running |
| POST | /api/auth/login | Log in with `{ "email", "password" }`; returns `{ token, user }`. Wrong credentials return 401 |
| GET | /api/auth/me | Returns the logged-in user (`id`, `name`, `role`, and `childId` for a child) |

Protected endpoints need the header `Authorization: Bearer <token>`. Without a valid token they return 401; with the wrong role they return 403.
| GET | /api/tasks | Returns all tasks from the database (walking skeleton) |

## Workflow

1. Each piece of work is a Jira issue (project key `HIVE`).
2. Create a branch named after the issue, e.g. `HIVE-77-tasks-page`.
3. Start commit messages with the issue key, e.g. `HIVE-77: add tasks page`.
4. Open a pull request; a teammate reviews it and CI must pass before merging.

## Documentation

- [Software Requirements Specification](docs/SRS.md)
- [Software Design Document](docs/SDD.md)
- [Project Management Plan](docs/PMP.md)
- [Team Conventions](docs/CONVENTIONS.md)