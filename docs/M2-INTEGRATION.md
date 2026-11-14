# M2 integration contract

M2 uses the M1 users/children schema, login, and authentication middleware now pulled from `main` into `HIVE-59-m2-links`.

- `server/middleware/authMiddleware.js` exports `requireAuth(req, res, next)` and sets `req.user = { id, name, role }` (plus `childId` for a child). `server/app.js` mounts `createM2Router({ db, requireAuth })` under `/api`; `server/index.js` only starts the app.
- `users` has `id`, `name`, `email`, `role`; `children` has `id`, `name`, `parent_id`, `user_id`. Missing tables or columns make M2 routes return 503. The shared error shape is `{ error: string }`.
- The M2 pages use M1's shared `client/src/api.js` for authenticated requests. `App.jsx` protects `/parent/children/:childId/specialists` for parents and `/specialist/children` for specialists. Parent and specialist home pages link to those routes; M2 does not create another login or auth context.
- Existing `links` tables are retained. New databases get foreign keys to `children(id)` and `users(id)`. SQLite cannot add foreign keys to an existing table with a simple `ALTER TABLE`; old databases with links need a separate data-preserving migration. Application code validates both records before inserts.
- M1's `seedDatabase` transaction now deletes `links` before `children` and `users`, then calls `seedLinks(db, { childId, userIds: ids })` after inserting the child. Only the demo teacher is linked. The unlinked specialist remains unlinked.

## API

- `GET /api/children` returns `[{ id, name }]` filtered by the authenticated parent, specialist link, or child account.
- `GET /api/children/:childId/links` returns linked specialists for the owning parent.
- `POST /api/children/:childId/links` accepts `{ "email": "specialist@example.com", "specialist_type": "teacher" }`. Supported types: teacher, psychologist, doctor, special education teacher, coach. Returns 201, 400 for invalid input, 404 if the registered specialist is absent, or 409 for an existing link.
- `DELETE /api/children/:childId/links/:specialistId` returns 204 or 404. All link routes return 403 for users other than the child's parent.

## `canAccessChild` for Öykü

```js
const canAccessChild = require('../middleware/canAccessChild');
router.get('/children/:childId/events', requireAuth, canAccessChild, listEvents);
// Only for routes where a child may read their own record:
router.get('/children/:childId/events', requireAuth, canAccessChild.allowChild, listEvents);
```

The middleware signature is `canAccessChild(req, res, next)`. It requires a prior `requireAuth` middleware to set `req.user.id` and `req.user.role`, plus `req.params.childId` as a positive decimal ID. It checks current database ownership or link on every request, then calls `next()`. Default access: owning parent or linked specialist. `allowChild` additionally allows the child's own `children.user_id` account. Responses: 401 missing identity, 400 invalid child ID, 404 absent child, 403 no relationship, 503 missing children schema. It does not verify JWTs itself. For routes addressed by a task/event ID, resolve the record's child ID and set `req.params.childId` before calling the middleware.
