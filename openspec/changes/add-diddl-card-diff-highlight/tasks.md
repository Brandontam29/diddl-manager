## 1. Store & State

- [ ] 1.1 Add `diffListId: number | null` field to the diddl store in `createDiddlStore.ts`
- [ ] 1.2 Create a derived signal `diffDiddlIds` that fetches list items when `diffListId` is set and returns a `Set<number>` of diddlIds
- [ ] 1.3 Clear `diffListId` on navigation in `layout.tsx` alongside the existing `selectedIndices` reset

## 2. Card Visual Treatment

- [ ] 2.1 Update `DiddlListCard.tsx` to read `diffListId` and `diffDiddlIds` from the store
- [ ] 2.2 Apply `opacity-40 grayscale` Tailwind classes to cards whose diddlId is not in `diffDiddlIds` when diff mode is active
- [ ] 2.3 Verify selection styling (blue border, checkmark) still renders correctly on grayed-out cards

## 3. List Picker UI

- [ ] 3.1 Create a "Compare with List" button component on the home page in `page.tsx`
- [ ] 3.2 Implement a popover that displays available lists using the existing `useLists` hook
- [ ] 3.3 On list selection, set `diffListId` in the store and close the popover
- [ ] 3.4 Add a dismiss/clear button that sets `diffListId` to null when diff mode is active
- [ ] 3.5 Show the active comparison list name in the UI when diff mode is active

## 4. Integration & Polish

- [ ] 4.1 Test diff mode with type and range filters active on the home page
- [ ] 4.2 Test that diff mode and selection mode coexist without visual conflicts
- [ ] 4.3 Test navigation away and back clears diff state properly
