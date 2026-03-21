## 1. Create migration

- [x] 1.1 Create `src/main/database/migrations/003_rename_list_modified_at.ts` with `ALTER TABLE list RENAME COLUMN last_modified_at TO updated_at`
- [x] 1.2 Register the migration in `db.ts` (import and add to `MyStaticMigrationProvider`)

## 2. Update types and models

- [x] 2.1 In `src/shared/list-models.ts`, rename `lastModifiedAt` to `updatedAt` in the `listSchema` Zod object

## 3. Update code references

- [x] 3.1 In `listMainHandlers.ts`, rename `lastModifiedAt` to `updatedAt` in `CREATE_LIST` and `UPDATE_LIST_NAME` handlers
- [x] 3.2 In `ListCard.tsx`, update `props.list.lastModifiedAt` to `props.list.updatedAt`

## 4. Verify

- [x] 4.1 Confirm the app compiles without type errors
- [ ] 4.2 Confirm deleting a list works without the updatedAt error
