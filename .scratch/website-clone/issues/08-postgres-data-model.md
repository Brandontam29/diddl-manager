# Postgres data model

Type: grilling
Status: resolved
Blocked by: 06

## Question

Map the desktop SQLite schema to a Drizzle Postgres schema on Neon. Reference:
`apps/desktop-app/src/shared/*-models.ts` and `apps/desktop-app/src/main/database/`.
Decide:

- Tables: global `diddls` catalog (read-only to users); per-user `list_sections`,
  `lists`, `list_items`, `profiles` — all keyed to the auth user id decided in
  "Auth architecture" (issue 06).
- Keep or drop desktop conventions: soft deletes (`deletedAt`), integer `position`
  ordering, auto-updated `updatedAt` (desktop uses a Kysely plugin), the default
  section (`isDefault`).
- Constraints: unique (listId, diddlId) as today (the desktop's known
  "duplicate sheet with different status" limitation is retained — scope frozen),
  name length rules from the zod schemas, per-user uniqueness of section names?
- Where per-user settings / UI state live on the web (desktop uses electron-store +
  ui-state-schema): a `settings` jsonb column/table, or client-side localStorage.
- Whether the zod schemas in `src/shared` are copied into `apps/website` or extracted
  to a shared workspace package.

Update 2026-08-20 (from grilling): account deletion is **soft delete** — no
`ON DELETE CASCADE`; user-owned rows keep the desktop's `deletedAt` convention, and
deleting an account soft-deletes its data. With Clerk as the auth provider there is
no local auth table to FK against — user scoping is a Clerk user id column (details
per "Auth architecture", issue 06). Use CONTEXT.md vocabulary: Catalog (global
data) vs Library (browse page).

## Answer

**2026-08-20 — resolved.** Two code-facts corrected the ticket's assumptions:
desktop migration 004 _dropped_ the unique `(list_id, diddl_id)` index (duplicate
list items are allowed), and deletion is mixed (sections/lists/profile soft-delete
via `deleted_at`; list items hard-delete, cascading with their list).

Drizzle Postgres schema (snake_case, timestamptz):

- `diddls` — `id int PK` (stable ids from `diddls.json`, no identity), `name`,
  `type` (pg enum, 28 values), `image_path`, `image_width`, `image_height`.
  Global, read-only to users.
- `list_sections` — `id identity PK`, `user_id text NOT NULL`, `name`, `position`,
  `is_default`, `created_at`/`updated_at`, `deleted_at`. Per-user unique index
  `(user_id, lower(name)) WHERE deleted_at IS NULL`. A default "Unsectioned"
  section is created per user alongside the profile lazy-upsert.
- `lists` — `id identity PK`, `user_id text NOT NULL`, `section_id FK`, `name`,
  `color`, `position`, timestamps, `deleted_at`. List names not unique (parity).
- `list_items` — `id identity PK`, `user_id text NOT NULL`, `list_id FK`
  (`ON DELETE CASCADE`), `diddl_id FK`, `quantity`, `is_damaged`, `is_incomplete`.
  No soft delete; duplicates allowed (parity with migration 004).
- `profiles` — `user_id text PK` (Clerk id), `name`, `birthdate`, `description`,
  `hobbies`, timestamps, `deleted_at`. **No `picture_path`** — the profile picture
  is Clerk's avatar (`imageUrl`); the one deliberate parity deviation, avoiding
  blob storage.

Conventions: `user_id` denormalized onto every user table so authorization is a
single `WHERE user_id = ?`; `updated_at` via Drizzle `$onUpdate` (replacing the
desktop's Kysely plugin); account deletion soft-deletes rows, nothing cascades from
Clerk. Settings & UI state (theme, card size, density, sidebar) are **client-only
localStorage** in v1 — no settings table; promoting to `profiles` later is additive.
The `src/shared` zod schemas are **copied** into `apps/website` (not a shared
workspace package) and adapted — the apps are expected to diverge.
