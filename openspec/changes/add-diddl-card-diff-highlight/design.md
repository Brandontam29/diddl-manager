## Context

The Diddl manager app displays a grid of collectible cards on the home page (`page.tsx`). Users can organize cards into lists. Currently, to see which cards are in a list, users must navigate to `/lists/[id]` which shows only the cards in that list. There is no way to see the full catalog with list membership visually indicated.

The app uses SolidJS with a reactive store (`diddlStore`) for card state and selection. List items are fetched via `useListItems(listId)` which returns `ListItem[]` with `diddlId` references. The existing `DiddlListCard` component already supports visual overlays (selection checkmarks, gradients) that can be extended.

## Goals / Non-Goals

**Goals:**
- Let users select a list to compare against while viewing the full catalog on the home page
- Visually distinguish cards that are in the selected list (normal) from those that are not (grayed out)
- Keep the comparison mode lightweight and dismissable

**Non-Goals:**
- Editing list membership from the comparison view (use existing add-to-list flow)
- Comparing two lists against each other
- Showing quantity/damage/incomplete metadata in comparison mode
- Persisting comparison state across navigation

## Decisions

### 1. State management: Store field vs. local signal

**Decision**: Add a `diffListId: number | null` field to `diddlStore` and a derived `diffDiddlIds: Set<number>` computed from fetched list items.

**Rationale**: Using the store makes the diff state accessible to both the page (for the list picker UI) and `DiddlListCard` (for styling) without prop drilling. The store already holds `selectedIndices` for similar cross-component state. A local signal in `page.tsx` would require threading the diff set through `DiddlCardListLimiter` → `DiddlListCard` via props, which is more invasive.

**Alternative considered**: SolidJS context provider wrapping the home page. Rejected because the store pattern is already established and simpler.

### 2. Fetching list items: Reuse `useListItems` hook

**Decision**: When `diffListId` is set, call `useListItems(diffListId)` to fetch the list's items, then build a `Set<number>` of diddlIds for O(1) lookup.

**Rationale**: `useListItems` already handles caching and the IPC call to the database. Building a Set ensures card lookup is constant-time even for large lists.

### 3. Visual treatment: CSS opacity + grayscale filter

**Decision**: Cards not in the selected list get `opacity-40 grayscale` via Tailwind classes. Cards in the list remain unchanged (no extra highlight border).

**Rationale**: Grayscale + reduced opacity is a standard "inactive" pattern that's immediately readable. Keeping "in-list" cards at normal appearance avoids visual clutter — the contrast with grayed-out cards is sufficient to identify them. This is simpler than adding highlight borders which would need to coexist with the existing selection border (blue-300).

### 4. List picker UI: Popover on the home page

**Decision**: Add a "Compare with List" button in the home page area (near the top of the card grid or in a toolbar area) that opens a popover with available lists. Selecting a list activates diff mode; a clear/X button dismisses it.

**Rationale**: A popover keeps the UI lightweight and consistent with the existing "Add to List" popover in the Taskbar. It doesn't require navigation or a modal.

### 5. Interaction with selection mode

**Decision**: Diff mode and selection mode can coexist. Selecting cards while in diff mode works normally — the gray styling is purely visual and doesn't affect selection behavior.

**Rationale**: These are orthogonal features. Blocking selection during diff mode would be confusing and unnecessary.

## Risks / Trade-offs

- **Large lists may have slow fetch**: If a list has thousands of items, the initial fetch when activating diff mode could lag. → Mitigation: `useListItems` already handles this; the Set construction is fast. Could add a loading indicator if needed.
- **Visual clutter with both diff and selection active**: Cards could have both gray-out styling and selection indicators simultaneously. → Mitigation: Selection overlay (blue border + checkmark) should visually override the gray, making selected-but-not-in-list cards still clearly selected.
- **Navigation clears diff state**: Since `diddlStore` state resets `selectedIndices` on navigation, we should similarly clear `diffListId` on navigation to avoid stale state. → Mitigation: Add `diffListId` reset in the same `createComputed` in `layout.tsx`.
