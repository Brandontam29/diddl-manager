# Personal data import from the desktop SQLite

Type: task
Status: open
Blocked by: 22, 24, 28

## Question

Implement and run spec.md §8: `apps/website/scripts/import-desktop.ts --db --user [--dry-run]` (`bun:sqlite` read-only, catalog imagePath guard, empty-account preflight, live rows only, default-section merge, zod validation, one transaction), gitignore `*.sqlite3` under `apps/website`; then the HITL runbook with the user: copy of `db.sqlite3` from their PC, sign-up, dry-run, import, cutover.

Done when: Dry run then real import complete for the user's account; the answer records row counts migrated.
