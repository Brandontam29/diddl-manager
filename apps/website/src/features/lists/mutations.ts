import { useRouter } from "@tanstack/solid-router";

import type { AddListItem } from "@/shared";
import {
  addListItems,
  createList,
  duplicateListItem,
  removeListItems,
  updateListItems,
} from "@/server/api";

/**
 * The desktop's `@solidjs/router` actions become plain server-function calls followed
 * by `router.invalidate()`, which re-runs the `/app` loaders (spec §5). Each hook
 * must be called from inside a component so `useRouter` can resolve.
 */
export const useListMutations = () => {
  const router = useRouter();

  return {
    createList: async (name: string, diddlIds: number[] = []) => {
      const list = await createList({ data: { name, diddlIds } });
      await router.invalidate();
      return list;
    },
  };
};

export type UpdateListItemsAction = {
  addQuantity?: number;
  isDamaged?: boolean;
  isIncomplete?: boolean;
};

export const useListItemMutations = () => {
  const router = useRouter();

  return {
    addListItems: async (
      listId: number,
      diddlIds: number[],
      state?: Omit<AddListItem, "diddlId">,
    ) => {
      if (diddlIds.length === 0) return [];

      const items = diddlIds.map((diddlId) => ({ diddlId, ...state }));
      const result = await addListItems({ data: { listId, items } });
      await router.invalidate();
      return result;
    },

    removeListItems: async (listId: number, listItemIds: number[]) => {
      if (listItemIds.length === 0) return { removedCount: 0 };

      const result = await removeListItems({ data: { listId, listItemIds } });
      await router.invalidate();
      return result;
    },

    duplicateListItems: async (listItemIds: number[]) => {
      for (const listItemId of listItemIds) {
        await duplicateListItem({ data: { listItemId } });
      }
      await router.invalidate();
    },

    updateListItems: async (
      listId: number,
      listItemIds: number[],
      action: UpdateListItemsAction,
    ) => {
      if (listItemIds.length === 0) return { updatedCount: 0, removedCount: 0 };

      const result = await updateListItems({ data: { listId, listItemIds, action } });
      await router.invalidate();
      return result;
    },
  };
};
