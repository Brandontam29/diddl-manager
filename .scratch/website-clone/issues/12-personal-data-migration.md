# Personal data migration plan

Type: grilling
Status: resolved
Blocked by: 08

## Question

The desktop app is in real use; its SQLite database holds actual sections, lists,
and list items. Decide how that data gets into the migrated user's Neon account:

- Extraction: where the SQLite file lives on the user's machine (see
  `apps/desktop-app/src/main/pathing/`), and whether export happens via a desktop
  feature, a manual copy, or a script in `apps/data-migrations`.
- Mapping: desktop diddl ids → catalog ids (stable per "Catalog seeding pipeline",
  issue 10), sections/lists/items → the new user's rows; what happens to soft-deleted
  rows.
- Trigger: one-off script run by the developer after the user signs up, or an in-app
  import? (One-off script is almost certainly right — decide and record it.)

## Answer

**2026-08-20 — resolved.** Code/data facts established first: the desktop DB is
`%APPDATA%\diddl-manager\db.sqlite3` (`dbPath()` in `src/main/pathing`; the `-dev`
suffix variant is dev-only). Desktop diddl ids are SQLite rowids from migration
001's single bulk insert of `src/main/database/diddls.json`, so `id = index + 1` —
**verified against a live DB: 3,913/3,913 rows match by name and imagePath**, which
means the web catalog's id contract (issue 10) makes desktop ids usable as-is, no
remap table. The copy of the prod DB on the dev machine is empty; the real data
lives on **another user's PC**, so extraction is a hand-off step.

**Trigger: one-off developer-run script**, no in-app import. Runbook:

1. **Extract (HITL, on the user's PC):** close the desktop app (flushes WAL; no
   `-wal`/`-shm` sidecars to worry about), copy
   `C:\Users\<name>\AppData\Roaming\diddl-manager\db.sqlite3`, send it to the dev.
   The file is never committed (`*.sqlite3` gitignored under `apps/website`).
2. **Sign up:** the user creates their Clerk account on the web app and signs in
   once (this lazy-creates their `profiles` row + default "Unsectioned" section).
   Dev reads their Clerk user id from the Clerk dashboard.
3. **Import:** `bun run scripts/import-desktop.ts --db <path> --user <clerk_id>
[--dry-run]` in `apps/website/scripts/` (next to the clean/load seed scripts),
   against the unpooled `DATABASE_URL`. Reads SQLite read-only via `bun:sqlite`,
   writes through the Drizzle schema in **one transaction**.
4. **Cutover:** the user stops using the desktop app; there is no sync or
   dual-write — the web account is the new source of truth.

**Mapping rules** (live rows only — **soft-deleted sections/lists and the items of
deleted lists are skipped**; desktop has no restore UI, so nothing is lost):

- Catalog guard: before writing, assert every referenced `diddl_id` has the same
  normalized `imagePath` (strip `app://diddl-images/`, `\`→`/`) in
  `apps/website/data/catalog.json`; abort on any mismatch.
- `list_section` → `list_sections`: the desktop default section maps onto the
  user's existing web default section (reused, not duplicated — the per-user
  `lower(name)` unique index would reject a second one anyway); other live sections
  are inserted with `user_id`, `name`, `position`, `created_at`/`updated_at`
  preserved. Old→new id map kept in memory.
- `list` → `lists`: live lists inserted with `name`, `color`, `position`,
  timestamps; `section_id` remapped, and a live list whose section is null,
  deleted, or missing lands in the default section.
- `list_item` → `list_items`: every item of a migrated list; `diddl_id` unchanged,
  `quantity`/`is_damaged`/`is_incomplete` copied, `user_id` stamped.
- `profile`: **not migrated** — the user re-enters name/birthdate/description/
  hobbies on the web; the picture is Clerk's avatar (issue 08).
- Validation: rows pass through the copied zod schemas before insert; failures
  are reported and abort the run (no partial writes).

**Idempotency:** precondition that the target account has no lists and no
non-default sections — the script aborts otherwise, so a re-run means wiping the
account's rows first. `--dry-run` prints the would-be counts and any catalog/zod
violations without connecting for writes.
