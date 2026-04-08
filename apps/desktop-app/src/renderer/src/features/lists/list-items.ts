import { action, createAsyncStore, query, revalidate } from "@solidjs/router";

import type { AddListItem, JoinedListItem, ListItemFilter } from "@shared";

import { trpc } from "@renderer/libs/trpc";

export const fetchListItems = query((listId?: number | null, filters?: ListItemFilter) => {
  if (listId === undefined || listId === null || !Number.isInteger(listId))
    return new Promise<null>((resolve) => {
      resolve(null);
    });

  return trpc.list.items.query({ listId, filters });
}, "list-items");

export const useListItems = (listId?: number | null, filters?: ListItemFilter) =>
  createAsyncStore<JoinedListItem[] | null>(() => fetchListItems(listId, filters), {
    initialValue: null,

    reconcile: {
      key: "listItemId",
      merge: false,
    },
  });

export const addListItemsAction = action(
  async (listId: number, diddlIds: number[], state?: AddListItem[]) => {
    const items = diddlIds.map((id) => ({ diddlId: id, ...state }));
    const result = await trpc.list.addItems.mutate({ listId, items });

    return result;
  },
);

export const removeListItemsAction = action(async (listId: number, listItemIds: number[]) => {
  const result = await trpc.list.removeItems.mutate({ listId, listItemIds });

  revalidate("lists-items");

  return result;
});

export const duplicateListItemAction = action(async (listItemIds: number[]) => {
  for (const id of listItemIds) {
    await trpc.list.duplicateItem.mutate({ listItemId: id });
  }

  revalidate("list-items");
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

    const result = await trpc.list.updateItems.mutate({ listId, listItemIds, action });

    revalidate("lists-items");

    return result;
  },
);
