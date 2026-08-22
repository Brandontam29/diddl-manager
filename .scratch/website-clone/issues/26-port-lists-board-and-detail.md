# Port the Lists board and List detail pages

Type: task
Status: open
Blocked by: 25

## Question

Implement `/app/lists` (dnd-kit sections board: create/rename/delete/reorder sections, create/delete/rename/recolor lists, cross-section moves, optimistic reorder in component state then `router.invalidate()`) and `/app/lists/$listId` (loader `getListItems(listId, search)` keyed on params + search; the verbatim `showAll`/`isDamaged`/`isIncomplete`/`minCount`/`maxCount` params; item table with batch update/remove/duplicate; NOT_FOUND → `notFound()`).

Done when: Every desktop list interaction works on the web against the `dev` branch; typecheck/lint/build green.
