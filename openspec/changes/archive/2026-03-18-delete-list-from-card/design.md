## Context

The lists overview page displays a grid of `ListCard` components, each wrapped in an `<A>` (link) tag for navigation. The backend already supports `window.api.deleteList(listId)` which performs a soft delete. No UI currently exposes this functionality.

## Goals / Non-Goals

**Goals:**
- Allow users to delete a list directly from the lists overview page
- Provide a confirmation step to prevent accidental deletion
- Keep the interaction pattern simple — an X button on each card

**Non-Goals:**
- Undo/restore functionality for deleted lists
- Bulk delete of multiple lists
- Delete from the list detail page (can be added separately)

## Decisions

### Place the delete button on ListCard, trigger handler via prop

**Choice**: Add an X button inside `ListCard` and accept an `onDelete` callback prop. The parent (`ListsPage`) passes the handler.

**Rationale**: Keeps `ListCard` presentational — it renders the button but doesn't own the delete logic. The page coordinates the action and list revalidation.

**Alternative considered**: Putting the delete action inside `ListCard` directly — rejected because the card shouldn't own data mutation concerns.

### Use stopPropagation to prevent navigation on delete click

**Choice**: The X button's click handler calls `e.stopPropagation()` and `e.preventDefault()` to prevent the parent `<A>` link from navigating.

**Rationale**: The card is wrapped in a link. Without stopping propagation, clicking delete would also navigate to the list detail page.

### Use a confirmation dialog before deleting

**Choice**: Show a simple confirm dialog (using the existing AlertDialog/dialog components if available, or `window.confirm` as fallback) before calling `deleteList`.

**Rationale**: Deletion is destructive (even if soft). A single click shouldn't immediately remove a list.

### Add deleteListAction to lists.ts

**Choice**: Create a `deleteListAction` in `lists.ts` that calls `window.api.deleteList(listId)` and revalidates the "lists" cache.

**Rationale**: Follows the existing pattern used by `createListAction` — actions are defined in the state module and revalidate after mutation.

## Risks / Trade-offs

- **[Accidental delete from mis-click]** → Mitigated by confirmation dialog
- **[Click target overlap with card link]** → Mitigated by stopPropagation/preventDefault on the button
