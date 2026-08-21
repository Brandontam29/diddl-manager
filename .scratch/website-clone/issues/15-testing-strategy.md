# Testing strategy

Type: grilling
Status: closed (2026-08-21)
Assignee: BrandonTam29
Blocked by: 09, 11

## Question

Decide the test surface for `apps/website`, mirroring the desktop app's shape where
it fits (bun test units at `test:unit`, Playwright at `test:e2e`):

- Which desktop unit tests port (e.g. `list-models.test.ts` zod rules) and what new
  units the server functions need (authorization scoping is the critical one:
  user A cannot touch user B's lists).
- E2e: Playwright against a local server + Neon branch database, or skip e2e for v1?
- Whether tests gate CI (extends the wiring from "Dev workflow, CI, and deployment
  config", issue 14).

Blocked on the API surface (issue 09) and route/UI plan (issue 11) since those define
what there is to test.

## Answer

**2026-08-21 — grilled with the user.** Facts that reshaped the question: the desktop
has only two real unit tests (`list-models.test.ts`, `resolve-app-image-path.test.ts`)
and its Playwright setup is the untouched scaffold (`tests/example.spec.ts`) — there
is no e2e suite to mirror.

### Runner & layout

- **Vitest** (user's pick over bun test — shares the Vite config, leaves the door
  open for Solid component tests later). Tests colocated as `*.test.ts` under
  `apps/website/src/`; `environment: node`.
- **No desktop tests port.** The copied zod schemas and the image-URL helper are
  untested in v1; new tests are written for web-specific code only.
- Scripts (`apps/website/package.json`): `test:unit` = `vitest run --exclude
'**/*.integration.test.ts'`; `test:integration` = `vitest run
--config vitest.integration.config.ts` (include `**/*.integration.test.ts`,
  `setupFiles: test/setup.ts`); `test` = both in sequence. Root `test:website` →
  `test`. Both pass with no tests present (`passWithNoTests`).

### Authorization scoping — DB-backed integration tests

- Server-function handlers are written as plain functions `(db, userId, input)`;
  the `createServerFn` + Clerk middleware wrapper is a thin shell that is **not**
  under test. Integration tests call the plain functions against real Postgres with
  real Drizzle queries — the only option that proves `WHERE user_id =` is present.
- Required coverage: for every mutating and reading handler over sections / lists /
  items / profile, user A's call against a row owned by user B returns the
  NOT_FOUND-style thrown error (reads) or affects zero rows (writes). Plus the
  lazy-upsert of profile + Default Section on first `getProfile`.
- Belt-and-braces structural check: one test that imports every handler module and
  asserts each exported handler takes `userId` as its second parameter.
- **Seeding/cleanup contract:** each test file generates random `user_id`s
  (`test_<uuid>`) and deletes its own rows in `afterAll` (items → lists → sections →
  profiles). No global truncate, so parallel CI runs on the same branch cannot
  collide. `test/setup.ts` throws a clear error when `DATABASE_URL` is unset — the
  suite never silently passes.

### Database

- A dedicated long-lived Neon branch **`test`** in the existing project (alongside
  `main` = prod and `dev` = local/previews from issue 14). Locally:
  `apps/website/.env.test` (gitignored; documented in `.env.example`) with
  `DATABASE_URL` = pooled `test` string and `DATABASE_URL_UNPOOLED` = direct `test`
  string. Schema kept current by `bun run --filter @diddl/website db:migrate` against
  `test` — CI does this automatically (below).

### E2e and component tests — ruled out for v1

- **No Playwright / e2e.** Vercel previews (Neon `dev` + Clerk dev instance) are the
  manual smoke test. Playwright + Clerk testing tokens is later work, not on this map.
- **No Solid component tests.** The UI is a port of working desktop code; risk sits
  in the data layer, covered above.

### CI

- `ci.yaml` (issue 14) gains, after `typecheck:website`: `db:migrate` against the
  `test` branch, then `test:website`. Two new GitHub Actions secrets:
  `TEST_DATABASE_URL` (pooled) and `TEST_DATABASE_URL_UNPOOLED` (direct), mapped to
  `DATABASE_URL` / `DATABASE_URL_UNPOOLED` for those steps. This is the first DB
  secret in GitHub; it is a throwaway `test` branch, so the issue-14 rule (no prod
  secret in GitHub) still holds. Failing tests block the PR.

### Facts later tickets depend on

- Neon branches: `main` (prod), `dev` (local + previews), `test` (CI + local tests).
- Scripts: `test`, `test:unit`, `test:integration`; root `test:website`.
- Secrets: `TEST_DATABASE_URL`, `TEST_DATABASE_URL_UNPOOLED`.
- Handler shape `(db, userId, input)` is now part of the API contract from issue 09.
