import { action, createAsyncStore, query, revalidate } from "@solidjs/router";

import type { AddListItem, ListItem } from "@shared";

export const fetchListItems = query((listId?: number | null) => {
  if (listId === undefined || listId === null || !Number.isInteger(listId))
    return new Promise<null>((resolve) => {
      resolve(null);
    });

  return window.api.getListItems(listId);
}, "list-items");

export const useListItems = (listId?: number | null) =>
  createAsyncStore<ListItem[] | null>(() => fetchListItems(listId), {
    initialValue: null,

    // default values
    reconcile: {
      key: "id",
      merge: false,
    },
  });

export const addListItemsAction = action(
  async (listId: number, diddlIds: number[], state?: AddListItem[]) => {
    const listItemsToAdd = diddlIds.map((id) => ({ diddlId: id, ...state }));
    const result = await window.api.addListItems(listId, listItemsToAdd);

    if (!result.success) {
      // toast
    }

    if (result.success) {
      // revalidate("lists-items");
    }

    return result;
  },
);

export const removeListItemsAction = action(async (listId: number, idsToRemove: number[]) => {
  const result = await window.api.removeListItems(listId, idsToRemove);

  if (!result.success) {
    // toast
  }

  if (result.success) {
    revalidate("lists-items");
  }

  return result;
});

export const updateListItemsAction = action(
  async (
    listId: number,
    listItemIds: number[],
    action: {
      addQuantity?: number;
      isDamaged?: boolean;
      isIncomplete?: boolean;
    },
  ) => {
    if (listId === null || listId === undefined || !Number.isInteger(listId)) {
      // toast
      return;
    }

    const result = await window.api.updateListItems(listId, listItemIds, action);

    if (!result.success) {
      // toast
    }

    if (result.success) {
      revalidate("lists-items");
    }

    return result;
  },
);

// // 1. Wrap your fetcher in 'cache' to give it a unique identity
// const getLists = cache(async () => {
//   return await fetch("/api/lists").then((r) => r.json());
// }, "lists-key");

// // 2. The Store
// const lists = createAsyncStore(() => getLists());

// // 3. The Refetcher (Action)
// const deleteItemAction = useAction(async (id: string) => {
//   await api.delete(id);
//   // Revalidate by the cache key
//   revalidate("lists-key");
// });
