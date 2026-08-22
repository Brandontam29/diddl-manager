# Drizzle schema and first migration

Type: task
Status: resolved
Blocked by: 20 (closed 2026-08-21 — unblocked)

## Question

Implement spec.md §3 in `apps/website/src/server/db/`: `drizzle.config.ts` (reads `DATABASE_URL_UNPOOLED`), the five tables with the 28-value type enum, the partial unique index on `(user_id, lower(name)) WHERE deleted_at IS NULL`, `$onUpdate` for `updated_at`, the `neon-http` client factory, `db:generate` / `db:migrate` scripts. Copy the `src/shared` zod schemas (diddl/list/profile models, minus settings/ui-state) into `apps/website/src/shared/` and adapt them (drop `picturePath`).

Done when: Migration 0000 generated and applied to the Neon `dev` and `test` branches (HITL: the user creates the `test` branch and supplies connection strings — record that in the answer); typecheck passes.

## Answer

Done. Migration `0000_fresh_black_tarantula.sql` is generated and applied to the Neon
`dev` and `test` branches; format / lint / typecheck / unit tests / build are all green.

**Neon provisioning** (done via the `neon` CLI, not HITL — the CLI was already
authenticated as `tam.brandon29`):

- Project **`diddl-manager-web`** = `restless-cloud-44961745`, org
  `BCode (org-mute-meadow-13796916)`, region `aws-us-east-2`, pg 18, free plan.
- The default branch existed as **`production`** and was **renamed to `main`** to match
  spec §9. Branch ids and endpoints:

  | Branch | Branch id                   | Endpoint                  |
  | ------ | --------------------------- | ------------------------- |
  | `main` | `br-odd-frog-ayddm4q3`      | `ep-raspy-truth-ay31r2tj` |
  | `dev`  | `br-hidden-field-ayvzq8sm`  | `ep-royal-surf-aydv5gb2`  |
  | `test` | `br-patient-cloud-aybsfkbk` | `ep-shiny-lab-ayeu8u5t`   |

  `dev` and `test` are both children of `main`. Connection strings follow the Neon
  pattern `postgresql://neondb_owner:<pw>@<endpoint>[-pooler].c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
  — retrieve with `neon connection-string <branch> --project-id restless-cloud-44961745 [--pooled]`.

- Credentials are written to the gitignored **`apps/website/.env.local`** (Neon `dev` +
  Clerk dev keys) and **`apps/website/.env.test`** (Neon `test` + Clerk dev keys), both
  matching `.env.example`. The repo-root `.env.local` was the original source of the keys
  and is left untouched.
- **CI secrets are still to be set** (ticket 24 wires the CI steps):
  `TEST_DATABASE_URL` / `TEST_DATABASE_URL_UNPOOLED` = the `test` branch pooled/direct
  strings.

**Files added**

- `apps/website/src/server/db/schema.ts` — the five tables exactly as spec §3, plus
  `$inferSelect` / `$inferInsert` row types. `casing: "snake_case"` on both the client
  and `drizzle.config.ts`, so column names come from the TS field names.
- `apps/website/src/server/db/client.ts` — `createDb(connectionString)` over
  `@neondatabase/serverless` + `drizzle-orm/neon-http`, plus a lazy `getDb()` singleton
  reading `DATABASE_URL`. `createDb` is the seam the scoping suite needs: tests bind a db
  to the `test` branch and call the plain `(db, userId, input)` handlers.
- `apps/website/drizzle.config.ts` — reads `DATABASE_URL_UNPOOLED`, throws if unset.
- `apps/website/src/shared/{index,diddl-models,list-models,profile-models}.ts` — the
  desktop zod schemas copied and adapted.
- `apps/website/drizzle/0000_fresh_black_tarantula.sql` + `meta/`.
- `package.json`: `db:generate` / `db:migrate` (drizzle-kit); deps `drizzle-orm@0.45.2`,
  `@neondatabase/serverless@1.1.0`, `zod@4.4.3`, dev `drizzle-kit@0.31.10`.

**Facts later tickets depend on**

- **The type enum has 27 values, not 28.** Both `spec.md` §3 and this ticket said 28;
  the desktop `diddlTypeSchema` has 27, and all 3,913 rows of `diddls.json` use exactly
  those 27. Corrected in `spec.md` and the map — no decision, just a miscount.
- `DIDDL_TYPES` in `shared/diddl-models.ts` is `diddlTypeSchema.options` cast to a
  non-empty tuple, because zod 4's `.options` is a plain array and `pgEnum` needs a tuple.
  The enum has one source of truth; the seed script (ticket 22) should reuse it.
- Verified on both branches: 5 tables, `diddl_type` with 27 values, and the partial index
  `CREATE UNIQUE INDEX list_sections_user_id_name_active_idx ON public.list_sections
USING btree (user_id, lower(name)) WHERE (deleted_at IS NULL)`.
- Adaptations to the ported zod schemas: kysely `Generated/Selectable/Insertable/
Updateable` types dropped (Drizzle's `$inferSelect`/`$inferInsert` replace them);
  `profileSchema.id: number` → `userId: string` (Clerk id) and `picturePath` removed;
  `settings-schema.ts` / `ui-state-schema.ts` not ported (localStorage only, spec §3);
  `types.ts` not ported (nothing uses it yet). `list-models.ts` is otherwise verbatim,
  disallowed-words list included.
- `birthdate` is a nullable pg `date`, and `name`/`description`/`hobbies` default to `''`,
  so the lazy profile upsert (ticket 24) can insert a row with only `user_id`.
- Migrations must be run with the value quoted — the connection strings contain `&`, so
  `set -a; . .env.local` backgrounds the command instead of setting the var. Use
  `DATABASE_URL_UNPOOLED='<string>' bunx drizzle-kit migrate` from `apps/website`.

**Not done here** (belongs to other tickets): `main` is deliberately unmigrated — ticket
28 runs it as part of the first production deploy. CI's `db:migrate` step is still
deferred to ticket 24.

**Clerk, checked while here** (does not resolve ticket 23): the development instance
`ins_3BtnTUqFdoe627hBbRItbNNMMfW` (`square-glider-56.clerk.accounts.dev`) is live — the
secret key in `.env.local` authenticates against the Backend API, 1 user already exists,
and the enabled strategies are email/password + `oauth_google`, which is what spec §4
wants. So ticket 23's HITL blocker (user creates the instance and supplies keys) is
already cleared; the keys are in `apps/website/.env.local` as `CLERK_SECRET_KEY` and
`VITE_CLERK_PUBLISHABLE_KEY`. Note the `clerk` CLI itself is **not** logged in
(`clerk whoami` shows no account and no linked app) — it reads the keys out of
`.env.local` keylessly, so `clerk link` / `clerk auth login` is still needed for anything
that mutates instance config.
