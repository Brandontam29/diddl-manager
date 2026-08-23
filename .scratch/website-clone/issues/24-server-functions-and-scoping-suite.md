# Server functions and the authorization-scoping suite

Type: task
Status: closed (2026-08-22)
Blocked by: 21 (closed 2026-08-22), 23 (closed 2026-08-22 — unblocked)

## Question

Implement spec.md §5 and §10: all 16 handlers as plain `(db, userId, input)` functions in `apps/website/src/server/`, wrapped by `createServerFn` + auth middleware + zod validators (GET for reads, POST for mutations, NOT*FOUND-style errors, `getProfile` lazy-upserting profile + Default Section). Integration suite against the Neon `test` branch: for every handler, user A vs user B's rows; lazy-upsert test; the structural 'userId is the second parameter' test; per-file `test*<uuid>`users with`afterAll`cleanup;`test/setup.ts`that throws without`DATABASE_URL`. Wire `db:migrate`(test branch) +`test:website`into ci.yaml using the`TEST_DATABASE_URL(\_UNPOOLED)` secrets (HITL: user adds the GitHub secrets).

Done when: Integration suite passes locally and in CI on main; every handler has a scoping test.

## Answer

**2026-08-22 — done.** Implemented spec §5 and §10 on `main`.

**Code (`apps/website/src/server/`)**

- `handlers/{catalog,sections,lists,items,profile}.ts` — the 16 handlers as plain
  `(db, userId, input)` functions plus their zod input schemas (`createSectionInput`,
  `updateListItemsInput`, …), re-exported from `handlers/index.ts`. Nothing in there
  imports TanStack Start or Clerk, so the integration suite calls them directly.
  `getCatalog(db)` is the one global handler and takes no `userId`.
- `api.ts` — the 16 `createServerFn`s: `authedMiddleware` (→ `context.userId`) +
  `.validator(zodSchema)` + `getDb()` around each handler. Reads are GET
  (`getCatalog` sets `Cache-Control: private, max-age=86400, immutable`), mutations POST.
- `errors.ts` — `AppError` with a tRPC-style `code`; `NotFoundError`, `BadRequestError`,
  `ConflictError` join `UnauthorizedError`. Missing row and foreign row are the same
  `NotFoundError`, deliberately indistinguishable.
- `session.ts` / `getSignedInUserId` left in place for the `/app` placeholder route;
  ticket 25 replaces that loader with `getCatalog` + `getSectionsWithLists` + `getProfile`.

**Semantics worth knowing (parity unless noted)**

- `getProfile` lazy-upserts the profile row (`INSERT … ON CONFLICT DO NOTHING`) and the
  Default Section ("Unsectioned", `is_default`, cannot be renamed/deleted);
  `getSectionsWithLists` and `createList` also ensure the Default Section exists.
- Section names are unique per user, case-insensitive (pre-check → `ConflictError`, plus
  the partial unique index as the backstop). **List names are not unique** (spec §3) —
  deviates from the desktop's `validateListName`, on purpose.
- `deleteSection` soft-deletes, appends the section's lists to the Default Section and
  renumbers the remaining sections 0..n. `deleteList` soft-deletes and leaves items attached.
- `updateListItems` applies `addQuantity` as a delta and hard-deletes rows that reach ≤ 0.
  `removeListItems` / `updateListItems` on a foreign list affect zero rows (they return
  counts); every single-row mutation on a foreign row throws `NotFoundError`.
- `reorderSections` must name exactly the user's active sections; `reorderLists` moves
  across sections and rejects foreign sections/lists with `NotFoundError`.
- **Neon HTTP has no interactive transactions** (`drizzle-orm/neon-http` throws on
  `db.transaction`). Multi-statement writes whose statements don't depend on each other
  (`deleteSection`, the two reorders) go through `db.batch()`, which Neon runs as one
  transaction. `createList` with `diddlIds` is insert-then-insert (not atomic); acceptable
  for v1 — the only failure mode is an empty list.
- Row shapes are Drizzle rows: timestamps are `Date` (TanStack Start serialises them),
  `profiles.birthdate` is a `YYYY-MM-DD` string or null (`updateProfileInput` takes
  `z.iso.date().nullable()`). The shared `ListSection`/`List`/`Profile` zod types still
  say ISO strings — ticket 25 decides whether to map or retype when it ports the UI.

**Tests**

- `handlers/*.integration.test.ts` (5 files, **37 tests**) against the Neon `test`
  branch through the plain handlers: for every sections/lists/items/profile handler,
  user A on user B's row → `NotFoundError` / zero rows; lazy-upsert + idempotence; filters,
  colour assignment, cross-section reorder, quantity-delta deletion. Each file uses
  `test_<uuid>` users and `afterAll(cleanupUsers)` (items → lists → sections → profiles);
  verified 0 `test_%` rows remain afterwards. `catalog.integration.test.ts` checks the
  seeded catalog (id 1 … n). Local run: 37 passed in ~12s.
- `handlers/handlers.structure.test.ts` (unit) — parses each user-scoped module and asserts
  every `export async function` is `(db: Db, userId: string, …)`; also that the index
  exports all 16 names.
- `test/db.ts` — `createTestDb()`, `testUserId()`, `cleanupUsers()`.
- `vitest.integration.config.ts` now loads env via Vite's `loadEnv("test", …)` because
  `bun run <script>` does **not** pass its `.env*` files to the vitest child; mode `test`
  makes `.env.test` win over `.env.local`, so the suite cannot hit the `dev` branch.

**CI (`ci.yaml`)** — job-level `env` maps the `TEST_DATABASE_URL` /
`TEST_DATABASE_URL_UNPOOLED` secrets; "Migrate the Neon test branch" (`db:migrate`) and
"Integration tests" run only when they are non-empty, so the job shows _skipped_ (never
green) until the secrets exist.

**HITL checklist (user)** — add two repository secrets at
GitHub → Settings → Secrets and variables → Actions:

- `TEST_DATABASE_URL` = the pooled string from `apps/website/.env.test`
  (`ep-shiny-lab-ayeu8u5t-pooler…`)
- `TEST_DATABASE_URL_UNPOOLED` = the direct string from the same file
  Then push `main` and confirm the two new steps run green. Local checks (format, lint,
  typecheck, unit, integration, build) are all green as of this commit.
