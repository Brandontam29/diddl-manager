## Why

Users have no way to delete lists from the lists overview page. The backend (`window.api.deleteList`) already supports soft deletion, but no UI exposes it. Users need a quick way to remove unwanted lists directly from the card grid.

## What Changes

- Add an X (close) button to the top-right corner of each `ListCard` component
- Clicking the X triggers a confirmation dialog before deleting
- On confirmation, call `window.api.deleteList(listId)` and revalidate the lists cache
- Add a `deleteListAction` to the lists state module (`lists.ts`)

## Capabilities

### New Capabilities

- `delete-list-ui`: UI for deleting a list from the lists overview page via an X button on each card

### Modified Capabilities

_None — no existing spec-level behavior changes._

## Impact

- `src/renderer/src/features/lists/components/ListCard.tsx` — add delete button
- `src/renderer/src/features/lists/lists.ts` — add delete action
- `src/renderer/src/pages/lists/page.tsx` — pass delete handler, handle click propagation so the X doesn't navigate
