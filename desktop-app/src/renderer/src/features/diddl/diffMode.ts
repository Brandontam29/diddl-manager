import { createResource } from "solid-js";

import { fetchListItems } from "@renderer/features/lists/list-items";

import { diddlStore } from "./createDiddlStore";

const [listItems] = createResource(
  () => diddlStore.diffListId,
  (listId) => fetchListItems(listId),
);

export const diffDiddlIds = (): Set<number> | null => {
  const items = listItems();
  if (!items) return null;
  return new Set(items.map((item) => item.diddlId));
};
