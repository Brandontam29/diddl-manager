# Drizzle schema and first migration

Type: task
Status: open
Blocked by: 20

## Question

Implement spec.md §3 in `apps/website/src/server/db/`: `drizzle.config.ts` (reads `DATABASE_URL_UNPOOLED`), the five tables with the 28-value type enum, the partial unique index on `(user_id, lower(name)) WHERE deleted_at IS NULL`, `$onUpdate` for `updated_at`, the `neon-http` client factory, `db:generate` / `db:migrate` scripts. Copy the `src/shared` zod schemas (diddl/list/profile models, minus settings/ui-state) into `apps/website/src/shared/` and adapt them (drop `picturePath`).

Done when: Migration 0000 generated and applied to the Neon `dev` and `test` branches (HITL: the user creates the `test` branch and supplies connection strings — record that in the answer); typecheck passes.
