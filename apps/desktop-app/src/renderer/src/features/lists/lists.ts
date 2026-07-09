import { action, createAsyncStore, query, revalidate } from "@solidjs/router";

import type { List, ListSectionWithLists } from "@shared";

import { trpc } from "@renderer/libs/trpc";

const fetchLists = query(() => {
  console.log("lists");
  return trpc.list.getAll.query();
}, "lists");

const fetchListSections = query(() => {
  return trpc.list.sections.getAll.query();
}, "listSections");

export const useLists = () =>
  createAsyncStore<List[] | null>(() => fetchLists(), {
    initialValue: null,
    // default values
    reconcile: {
      key: "id",
      merge: false,
    },
  });

export const useListSections = () =>
  createAsyncStore<ListSectionWithLists[] | null>(() => fetchListSections(), {
    initialValue: null,
    reconcile: {
      key: "id",
      merge: false,
    },
  });

export const createListAction = action(async (currentListName: string, diddlIds: number[]) => {
  const list = await trpc.list.create.mutate({ name: currentListName, diddlIds });
  revalidate("lists");
  revalidate("listSections");

  return list;
});

export const deleteListAction = action(async (listId: number) => {
  await trpc.list.delete.mutate({ listId });
  revalidate("lists");
  revalidate("listSections");
});

export const updateListColorAction = action(async (listId: number, color: string) => {
  await trpc.list.updateColor.mutate({ listId, color });
  await revalidate("lists");
  await revalidate("listSections");
});

export const createListSectionAction = action(async (name: string) => {
  const section = await trpc.list.sections.create.mutate({ name });
  await revalidate("listSections");
  return section;
});

export const renameListSectionAction = action(async (sectionId: number, name: string) => {
  await trpc.list.sections.rename.mutate({ sectionId, name });
  await revalidate("listSections");
});

export const deleteListSectionAction = action(async (sectionId: number) => {
  await trpc.list.sections.delete.mutate({ sectionId });
  await revalidate("lists");
  await revalidate("listSections");
});

export const reorderListSectionsAction = action(async (sectionIds: number[]) => {
  await trpc.list.sections.reorder.mutate({ sectionIds });
  await revalidate("listSections");
});

export const reorderListsAction = action(
  async (sections: Array<{ sectionId: number; listIds: number[] }>) => {
    await trpc.list.reorderLists.mutate({ sections });
    await revalidate("lists");
    await revalidate("listSections");
  },
);

export const fetchSectionedLists = fetchListSections;
