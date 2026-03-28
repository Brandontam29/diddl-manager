import { createResource } from "solid-js";

import { trpc } from "@renderer/libs/trpc";

import { diddlStore } from "./createDiddlStore";

export const [diffListItems] = createResource(
  () => diddlStore.diffListId,
  (listId) => {
    if (listId === undefined || listId === null || !Number.isInteger(listId)) return null;
    return trpc.list.items.query({ listId });
  },
);

const [lists] = createResource(() => trpc.list.getAll.query());

export const diffList = () => {
  const id = diddlStore.diffListId;
  if (!id) return null;
  return lists()?.find((l) => l.id === id) ?? null;
};

export const isDiffModeActive = () => diffList() !== null;

export const diffDiddlIds = (): Set<number> | null => {
  const items = diffListItems();
  if (!items) return null;
  return new Set(items.map((item) => item.diddlId));
};
