## Context

The `list` table uses `last_modified_at` while the `AutoUpdatedAtPlugin` expects `updated_at`. The `profile` table already uses `updated_at`. Standardizing to `updated_at` aligns the `list` table with the plugin and the `profile` table convention.

## Goals / Non-Goals

**Goals:**
- Rename `last_modified_at` to `updated_at` on the `list` table via a migration
- Update all TypeScript types and code references from `lastModifiedAt` to `updatedAt`
- Fix the delete-list error

**Non-Goals:**
- Changing other tables or adding `updated_at` to tables that don't have timestamp columns (`diddl`, `list_item`)

## Decisions

### Use ALTER TABLE RENAME COLUMN

**Choice**: SQLite supports `ALTER TABLE ... RENAME COLUMN` (since SQLite 3.25.0). Use this in a Kysely migration.

**Rationale**: Simplest approach — no data loss, no table recreation. better-sqlite3 bundles a modern SQLite version that supports this.

### Update all references in one pass

**Choice**: Rename `lastModifiedAt` → `updatedAt` in the Zod schema, List type, ListDb type, listMainHandlers, and ListCard component simultaneously.

**Rationale**: Since the CamelCasePlugin handles the mapping, once the DB column is renamed, all code must use the new name consistently.

## Risks / Trade-offs

- **[Existing data preserved]** → `RENAME COLUMN` preserves all existing data values.
- **[Auto-set by plugin after migration]** → The `AutoUpdatedAtPlugin` will automatically set `updatedAt` on every UPDATE to the list table, so manual `lastModifiedAt: new Date().toISOString()` calls in `CREATE_LIST` and `UPDATE_LIST_NAME` can be replaced with `updatedAt` or removed (the plugin handles UPDATE, but INSERT still needs it explicitly).
