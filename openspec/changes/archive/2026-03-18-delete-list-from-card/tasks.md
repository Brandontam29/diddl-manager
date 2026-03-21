## 1. Add delete action to lists state

- [x] 1.1 Add `deleteListAction` to `src/renderer/src/features/lists/lists.ts` that calls `window.api.deleteList(listId)` and revalidates the "lists" cache
- [x] 1.2 Export `deleteListAction` from the lists feature index

## 2. Add delete button to ListCard

- [x] 2.1 Add an X button (using lucide-solid `X` icon) to the top-right corner of `ListCard`
- [x] 2.2 Accept an `onDelete` callback prop on `ListCard`
- [x] 2.3 Wire the X button click to call `onDelete`, using `stopPropagation` and `preventDefault` to avoid navigation

## 3. Wire up delete in ListsPage

- [x] 3.1 Add a delete handler in `ListsPage` that shows a confirmation dialog and calls `deleteListAction`
- [x] 3.2 Pass the `onDelete` handler to each `ListCard`

## 4. Verify

- [x] 4.1 Confirm the app compiles without type errors
- [ ] 4.2 Confirm clicking X shows confirmation and does not navigate
- [ ] 4.3 Confirm deleting a list removes it from the grid
