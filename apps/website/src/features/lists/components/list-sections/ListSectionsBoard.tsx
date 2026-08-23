import { DragDropProvider, type DragDropProviderProps } from "@dnd-kit/solid";
import { For, Show, createSignal } from "solid-js";

import FallbackNoLists from "@/components/fallback/FallbackNoLists";
import { type AppSection, useAppData } from "@/features/app-data";

import { errorMessage, showToast, useListMutations, useSectionMutations } from "../../mutations";
import ListSection from "./ListSection";
import { type DragData, moveList, moveSection } from "./dragData";

export type ListActions = ReturnType<typeof useListMutations>;

/**
 * The Sections board (spec §6). The loader's sections render as-is; a drop sets a
 * temporary override so the new order shows instantly, the server call follows,
 * and the override is cleared once the loader has been re-run (success or not),
 * so a stale board cannot keep failing.
 */
const ListSectionsBoard = () => {
  const appData = useAppData();
  const listActions = useListMutations();
  const { reorderSections } = useSectionMutations();

  const [override, setOverride] = createSignal<AppSection[] | null>(null);
  const sections = () => override() ?? appData().sections;
  const isEmpty = () => sections().every((section) => section.lists.length === 0);

  const persist = async (nextSections: AppSection[], save: () => Promise<unknown>) => {
    setOverride(nextSections);
    try {
      await save();
    } catch (error) {
      console.error("reorder failed", error);
      showToast(errorMessage(error, "Could not save list order"), "destructive");
      await listActions.invalidate();
    } finally {
      setOverride(null);
    }
  };

  const handleDragEnd: DragDropProviderProps["onDragEnd"] = (event) => {
    const { source, target } = event.operation;
    if (event.canceled || !source || !target) return;

    const sourceData = source.data as DragData;
    const targetData = target.data as DragData;

    if (sourceData.type === "section") {
      const next = moveSection(sections(), sourceData.sectionId, targetData.sectionId);
      if (!next) return;
      void persist(next, () => reorderSections(next.map((section) => section.id)));
      return;
    }

    const next = moveList(sections(), sourceData, targetData);
    if (!next) return;
    const touched = new Set([sourceData.sectionId, targetData.sectionId]);
    void persist(next, () =>
      listActions.reorderLists(
        next
          .filter((section) => touched.has(section.id))
          .map((section) => ({
            sectionId: section.id,
            listIds: section.lists.map((list) => list.id),
          })),
      ),
    );
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div class="space-y-8">
        <Show when={isEmpty()}>
          <FallbackNoLists />
        </Show>
        <For each={sections()}>
          {(section) => <ListSection section={section} actions={listActions} />}
        </For>
      </div>
    </DragDropProvider>
  );
};

export default ListSectionsBoard;
