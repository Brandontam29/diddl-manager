import { createEffect, createMemo, createResource, createSignal, on } from "solid-js";

import { trpc } from "@renderer/libs/trpc";

import { diddlStore } from "./createDiddlStore";

const [cache, setCache] = createSignal<Map<number, { diddlId: number }[]>>(new Map());
const [loading, setLoading] = createSignal(false);

createEffect(
  on(
    () => [...diddlStore.diffListIds],
    async (ids) => {
      const currentCache = cache();
      const newIds = ids.filter((id) => !currentCache.has(id));

      if (newIds.length === 0) return;

      setLoading(true);
      const updatedCache = new Map(currentCache);

      for (const id of newIds) {
        const items = await trpc.list.items.query({ listId: id });
        updatedCache.set(id, items);
      }

      setCache(updatedCache);
      setLoading(false);
    },
  ),
);

export const isDiffModeActive = () => diddlStore.diffListIds.length > 0;

export const isLoadingDiff = loading;

export const diffDiddlIds = createMemo((): Set<number> | null => {
  if (!isDiffModeActive()) return null;
  const currentCache = cache();
  const ids = new Set<number>();
  for (const listId of diddlStore.diffListIds) {
    const items = currentCache.get(listId);
    if (items) {
      for (const item of items) {
        ids.add(item.diddlId);
      }
    }
  }
  return ids;
});

const [lists] = createResource(() => trpc.list.getAll.query());

export const diddlListColors = createMemo((): Map<number, string[]> => {
  const result = new Map<number, string[]>();
  if (!isDiffModeActive()) return result;

  const allLists = lists();
  if (!allLists) return result;

  const colorByListId = new Map(allLists.map((l) => [l.id, l.color]));
  const currentCache = cache();

  for (const listId of diddlStore.diffListIds) {
    const color = colorByListId.get(listId);
    if (!color) continue;

    const items = currentCache.get(listId);
    if (!items) continue;

    for (const item of items) {
      const existing = result.get(item.diddlId);
      if (existing) {
        existing.push(color);
      } else {
        result.set(item.diddlId, [color]);
      }
    }
  }

  return result;
});

export const diffListNames = (allLists: { id: number; name: string }[] | null) => {
  if (!allLists) return [];
  const selectedIds = new Set(diddlStore.diffListIds);
  return allLists.filter((l) => selectedIds.has(l.id));
};

export const clearDiffCache = () => setCache(new Map());
