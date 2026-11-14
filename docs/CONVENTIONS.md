# Team Conventions

Shared rules so that each of us can build our module without waiting for the others.
If you need to change something here, say so in the group first.

## Ports

| Part | Address |
|---|---|
| Backend (Express) | http://localhost:3001 |
| Frontend (Vite) | http://localhost:5173 – requests to `/api` are forwarded to the backend |

## Roles

Exactly these strings: `'parent'`, `'specialist'`, `'child'`. The role comes from the `users` table, never from the request.

## Protecting a route

Every route except `POST /api/auth/login` and `GET /api/health` needs `requireAuth`.

```js
const { requireAuth, requireRole } = require('../middleware/authMiddleware');

// Any logged-in user
router.get('/something', requireAuth, handler);

// Only some roles (others get 403)
router.post('/something', requireAuth, requireRole('parent', 'specialist'), handler);
```

After `requireAuth`, `req.user` is:

```js
{ id, name, role }            // parent, specialist
{ id, name, role, childId }   // child – childId is children.id of their own record
```

`req.user.id` is always `users.id`. For a child, use `req.user.childId` when you need the `children.id`.

## Child access (M2, HIVE-61)

Routes with `:childId` must also check the user's relationship to the child (SDD Section 4):

- parent → only their own child (`children.parent_id`)
- specialist → only a child they are currently linked to (`specialist_child_links`)
- child → only themself, and only where the SDD access column allows it

The exact function signature is announced by Elif in HIVE-61. Until it is merged, use a temporary stand-in that always allows access, and replace it when the real one arrives.

## Errors

Always JSON in the form `{ "error": "Message shown to the user." }`

| Status | When |
|---|---|
| 400 | Invalid or missing data |
| 401 | No token, or the token is invalid or expired |
| 403 | Logged in, but not allowed to do this |
| 404 | Record not found |

Success: `200` with data, `201` with the created record, `204` with no body after a delete.

## Database

- Table and column names are exactly as in SDD Section 3 (snake_case).
- Add new tables in `server/db.js` **after** every table they reference (`users`, then `children`, then the rest).
- In `server/seed.js`, add your table to the **front** of `TABLES_IN_DELETE_ORDER` so it is emptied before the tables it references.
- Seed data is synthetic only. Demo accounts are listed in the README.

## Frontend API calls

All requests go through the shared helper `client/src/api.js` (added in HIVE-55). It adds the token and turns error responses into a thrown `Error` with the server's message. Until it is merged, build your pages with sample data.

## Git

- Branch: `HIVE-xx-short-description`, commit: `HIVE-xx Short description`.
- Never push to `main`. Open a pull request, tell the group, and we merge together.
- Before opening a pull request, merge the latest `main` into your branch and check that it still runs.
