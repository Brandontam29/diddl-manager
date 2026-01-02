import { action, createAsyncStore, query, revalidate } from "@solidjs/router";

import type { List } from "@shared";

const fetchLists = query(() => {
  console.log("lists");
  return window.api.getLists();
}, "lists");

export const useLists = () =>
  createAsyncStore<List[] | null>(() => fetchLists(), {
    initialValue: null,

    // default values
    reconcile: {
      key: "id",
      merge: false,
    },
  });

export const createListAction = action(async (currentListName: string, diddlIds: number[]) => {
  const list = await window.api.createList(currentListName, diddlIds);

  revalidate("lists");

  return list;
});
