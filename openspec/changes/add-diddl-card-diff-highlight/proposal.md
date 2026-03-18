## Why

When managing a Diddl collection, users need to quickly see which items from their full catalog are already in a specific list and which are not. Currently, selecting a list navigates away from the main page, making it hard to compare the full collection against a list's contents. A diff/highlight mode on the main page would let users visually identify gaps in their lists at a glance.

## What Changes

- Add a "Compare with List" mode accessible from the home page that lets users pick a list to compare against
- Diddl cards that are **not** in the selected list get grayed out (reduced opacity, desaturated) to visually de-emphasize them
- Diddl cards that **are** in the selected list remain fully visible with a subtle highlight indicator
- A UI control (e.g., dropdown or popover) on the home page to select which list to compare against
- A way to dismiss the comparison mode and return to normal view

## Capabilities

### New Capabilities
- `list-diff-mode`: Visual comparison mode that highlights/grays out diddl cards on the main page based on membership in a selected list

### Modified Capabilities

## Impact

- `desktop-app/src/renderer/src/pages/page.tsx` - Add list selector UI and pass diff state down
- `desktop-app/src/renderer/src/features/diddl/components/DiddlListCard.tsx` - Apply gray-out styling based on diff state
- `desktop-app/src/renderer/src/features/diddl/createDiddlStore.ts` - Potentially add diff mode state (active list ID, list item IDs)
- `desktop-app/src/renderer/src/features/lists/list-items.ts` - Reuse existing `useListItems` to fetch comparison data
