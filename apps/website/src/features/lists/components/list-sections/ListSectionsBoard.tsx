import { DragDropProvider } from "@dnd-kit/solid";
import { For, Show, createEffect, createSignal } from "solid-js";

import FallbackNoLists from "@/components/fallback/FallbackNoLists";
import { type AppSection, useAppData } from "@/features/app-data";

import { errorMessage, showToast, useListMutations, useSectionMutations } from "../../mutations";
import ListSection from "./ListSection";
import { cloneSections, moveList, moveSection, readDragData } from "./dragData";

const showOrderError = (error: unknown) => {
  console.error("reorder failed", error);
  showToast(errorMessage(error, "Could not save list order"), "destructive");
};

/**
 * The Sections board (spec §6). The loader's sections are mirrored into component
 * state so a drop reorders instantly; the server call follows and, on failure, the
 * previous order is restored. `router.invalidate()` then re-syncs from the loader.
 */
const ListSectionsBoard = () => {
  const appData = useAppData();
  const { reorderSections } = useSectionMutations();
  const { reorderLists } = useListMutations();

  const [sections, setSections] = createSignal<AppSection[]>([]);

  createEffect(() => {
    setSections(cloneSections(appData().sections));
  });

  const persistSectionOrder = async (nextSections: AppSection[]) => {
    await reorderSections(nextSections.map((section) => section.id));
  };

  const persistListOrder = async (nextSections: AppSection[], sectionIds: number[]) => {
    await reorderLists(
      nextSections
        .filter((section) => sectionIds.includes(section.id))
        .map((section) => ({
          sectionId: section.id,
          listIds: section.lists.map((list) => list.id),
        })),
    );
  };

  const handleDragEnd = async (event: unknown) => {
    const operation = (event as { canceled?: boolean; operation?: unknown }).operation as
      | { source?: unknown; target?: unknown }
      | undefined;

    if ((event as { canceled?: boolean }).canceled || !operation?.source || !operation?.target) {
      return;
    }

    const source = readDragData(operation.source);
    const target = readDragData(operation.target);

    if (!source || !target) return;

    const previousSections = cloneSections(sections());

    if (source.type === "section") {
      const nextSections = moveSection(sections(), source.sectionId, target.sectionId);
      if (!nextSections) return;

      setSections(nextSections);

      try {
        await persistSectionOrder(nextSections);
      } catch (error) {
        setSections(previousSections);
        showOrderError(error);
      }

      return;
    }

    const nextSections = moveList(sections(), source, target);
    if (!nextSections) return;

    setSections(nextSections);

    try {
      await persistListOrder(nextSections, [...new Set([source.sectionId, target.sectionId])]);
    } catch (error) {
      setSections(previousSections);
      showOrderError(error);
    }
  };

  const hasLists = () => sections().some((section) => section.lists.length > 0);

  return (
    <Show when={hasLists() || sections().length > 0} fallback={<FallbackNoLists />}>
      <DragDropProvider onDragEnd={handleDragEnd}>
        <div class="space-y-8">
          <For each={sections()}>{(section) => <ListSection section={section} />}</For>
        </div>
      </DragDropProvider>
    </Show>
  );
};

export default ListSectionsBoard;
