## Context

The `ListsPage` currently lacks a max-width container, causing it to stretch excessively on large screens. The grid layout uses `grid-flow-col`, which is not standard for a responsive list of cards. `ListCard` has a `max-w-md` but doesn't have a fixed height, leading to potential inconsistencies.

## Goals / Non-Goals

**Goals:**
- Implement a responsive grid that works well on all screen sizes.
- Ensure all list cards in the grid have the same dimensions.
- Center the content on large screens with a max-width container.

**Non-Goals:**
- Changing the functionality of list creation or navigation.
- Modifying the content within the cards (except for layout purposes).

## Decisions

- **Container**: Wrap the `ListsPage` content in a `div` with `max-w-7xl mx-auto w-full`.
- **Grid Layout**: Replace `grid-flow-col` with `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` (or similar responsive classes) to allow cards to wrap naturally.
- **Card Sizing**: 
  - Set `ListCard` to `h-full` to ensure they stretch to fill the grid cell height if needed.
  - Remove `max-w-md` from `ListCard` and let the grid control the width.
  - Use `flex flex-col` on the `Card` component inside `ListCard` to ensure content alignment.

## Risks / Trade-offs

- [Risk] Very long list names might still cause height differences. → Mitigation: Ensure `h-full` is used and possibly add `line-clamp` if necessary, though `h-full` in a grid usually handles this by stretching all items in a row.
