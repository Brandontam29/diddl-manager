import { action, createAsyncStore, query, revalidate } from "@solidjs/router";

import type { List } from "@shared";

import { trpc } from "@renderer/libs/trpc";

const fetchLists = query(() => {
  console.log("lists");
  return trpc.list.getAll.query();
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
  const list = await trpc.list.create.mutate({ name: currentListName, diddlIds });

  revalidate("lists");

  return list;
});
