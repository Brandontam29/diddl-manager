import { toaster } from "@kobalte/core/toast";
import { useRouter } from "@tanstack/solid-router";

import { Toast, ToastContent, ToastProgress, ToastTitle } from "@/components/ui/toast";
import { type DiddlCardItem, clearSelectedIds, partitionCardItems } from "@/features/diddl";
import type { AddListItem } from "@/shared";
import {
  addListItems,
  createList,
  createSection,
  deleteList,
  deleteSection,
  duplicateListItem,
  removeListItems,
  renameList,
  renameSection,
  reorderLists,
  reorderSections,
  updateListColor,
  updateListItems,
} from "@/server/api";

export const showToast = (title: string, variant: "default" | "destructive" = "default") =>
  toaster.show((props) => (
    <Toast toastId={props.toastId} variant={variant}>
      <ToastContent>
        <ToastTitle>{title}</ToastTitle>
      </ToastContent>
      <ToastProgress />
    </Toast>
  ));

export const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

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

    deleteList: async (listId: number) => {
      await deleteList({ data: { listId } });
      await router.invalidate();
    },

    renameList: async (listId: number, name: string) => {
      await renameList({ data: { listId, name } });
      await router.invalidate();
    },

    updateListColor: async (listId: number, color: string) => {
      await updateListColor({ data: { listId, color } });
      await router.invalidate();
    },

    /**
     * Full order of the named sections, lists included — a list is placed in whichever
     * section names it, so a cross-section move is one call with both sections.
     */
    reorderLists: async (sections: Array<{ sectionId: number; listIds: number[] }>) => {
      await reorderLists({ data: { sections } });
      await router.invalidate();
    },
  };
};

export const useSectionMutations = () => {
  const router = useRouter();

  return {
    createSection: async (name: string) => {
      const section = await createSection({ data: { name } });
      await router.invalidate();
      return section;
    },

    renameSection: async (sectionId: number, name: string) => {
      await renameSection({ data: { sectionId, name } });
      await router.invalidate();
    },

    deleteSection: async (sectionId: number) => {
      await deleteSection({ data: { sectionId } });
      await router.invalidate();
    },

    /** `sectionIds` must be every active section exactly once, in the new order. */
    reorderSections: async (sectionIds: number[]) => {
      await reorderSections({ data: { sectionIds } });
      await router.invalidate();
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

  const mutations = {
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

    /** Parallel copies; whatever did get copied is refreshed even when some fail. */
    duplicateListItems: async (listItemIds: number[]) => {
      const results = await Promise.allSettled(
        listItemIds.map((listItemId) => duplicateListItem({ data: { listItemId } })),
      );
      await router.invalidate();

      const failed = results.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        throw new Error(`Could not duplicate ${failed.length} of ${listItemIds.length}`);
      }
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

    /**
     * "+1" / "-1" on a List page for a mixed selection: existing List Items get their
     * quantity bumped (a quantity reaching 0 removes the row), Catalog Diddls not yet
     * in the list are added with quantity 1 when `delta > 0`. The selection is
     * cleared whenever the set of cards changed (rows added or removed).
     */
    bumpQuantity: async (listId: number, items: DiddlCardItem[], delta: number) => {
      const { listItemIds, diddlIds } = partitionCardItems(items);
      let changedRows = 0;

      if (listItemIds.length > 0) {
        const result = await mutations.updateListItems(listId, listItemIds, {
          addQuantity: delta,
        });
        changedRows += result.removedCount;
      }

      if (delta > 0 && diddlIds.length > 0) {
        const added = await mutations.addListItems(listId, diddlIds);
        changedRows += added.length;
      }

      if (changedRows > 0) clearSelectedIds();
    },
  };

  return mutations;
};

/** Runs a mutation, toasting instead of leaving an unhandled rejection. */
export const runMutation = async (label: string, run: () => Promise<unknown>) => {
  try {
    await run();
  } catch (error) {
    console.error(`${label} failed`, error);
    showToast(errorMessage(error, `${label} failed`), "destructive");
  }
};
