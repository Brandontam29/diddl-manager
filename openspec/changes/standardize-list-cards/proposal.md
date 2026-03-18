## Why

The current lists page has a layout that does not scale well on larger screens and the cards in the grid can have inconsistent sizes depending on their content. Standardizing the card sizes and adding a max-width container will improve the visual consistency and readability of the lists page across different screen sizes.

## What Changes

- Add a max-width container (e.g., `max-w-7xl mx-auto`) to the `ListsPage` component.
- Standardize the `ListCard` component to have a consistent height and width when displayed in a grid.
- Update the grid layout in `ListsPage` to use a standard responsive grid (e.g., `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`) instead of `grid-flow-col`.

## Capabilities

### New Capabilities
- `standardized-list-layout`: UI requirements for consistent list card display and page containment.

### Modified Capabilities

## Impact

- `desktop-app/src/renderer/src/pages/lists/page.tsx`: Layout container and grid classes will be updated.
- `desktop-app/src/renderer/src/features/lists/components/ListCard.tsx`: Card sizing styles will be adjusted for consistency.
