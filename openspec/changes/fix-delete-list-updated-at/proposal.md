## Why

The `AutoUpdatedAtPlugin` injects `updatedAt` (mapped to `updated_at` by CamelCasePlugin) into every UPDATE query. The `list` table uses `last_modified_at` instead of `updated_at`, causing `SqliteError: no such column: updatedAt` when soft-deleting a list. The fix is to standardize the column name via a migration.

## What Changes

- Add a new migration (003) to rename `last_modified_at` to `updated_at` on the `list` table
- Update the `list` database types and shared models to use `updatedAt` instead of `lastModifiedAt`
- Update all code referencing `lastModifiedAt` on list models to use `updatedAt`

## Capabilities

### New Capabilities

_None — bug fix with schema migration._

### Modified Capabilities

_None._

## Impact

- New migration file `src/main/database/migrations/003_rename_list_modified_at.ts`
- `src/main/database/db.ts` — register the new migration
- `src/main/database/index.ts` — update `RawDatabase` type if list table types are defined there
- `src/shared/list-models.ts` — rename `lastModifiedAt` to `updatedAt` in types
- `src/main/list/listMainHandlers.ts` — update references from `lastModifiedAt` to `updatedAt`
- Renderer components that display `lastModifiedAt` (e.g., `ListCard.tsx`)
