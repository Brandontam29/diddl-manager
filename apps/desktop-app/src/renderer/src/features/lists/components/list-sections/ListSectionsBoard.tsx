import { DragDropProvider } from "@dnd-kit/solid";
import { useAction } from "@solidjs/router";
import { For, Show, createEffect, createSignal } from "solid-js";

import type { ListSectionWithLists } from "@shared";

import FallbackLoadingLists from "@renderer/components/fallback/FallbackLoadingLists";
import FallbackNoLists from "@renderer/components/fallback/FallbackNoLists";
import {
  reorderListSectionsAction,
  reorderListsAction,
  useListSections,
} from "@renderer/features/lists";

import ListSection from "./ListSection";
import { showListOrderErrorToast } from "./ListOrderErrorToast";
import { cloneSections, readDragData } from "./dragData";

const ListSectionsBoard = () => {
  const loadedSections = useListSections();
  const reorderSections = useAction(reorderListSectionsAction);
  const reorderLists = useAction(reorderListsAction);

  const [sections, setSections] = createSignal<ListSectionWithLists[]>([]);

  createEffect(() => {
    const next = loadedSections();
    if (next) setSections(cloneSections(next));
  });

  const persistSectionOrder = async (nextSections: ListSectionWithLists[]) => {
    await reorderSections(nextSections.map((section) => section.id));
  };

  const persistListOrder = async (nextSections: ListSectionWithLists[], sectionIds: number[]) => {
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
    const nextSections = cloneSections(sections());

    if (source.type === "section") {
      const sourceIndex = nextSections.findIndex((section) => section.id === source.sectionId);
      const targetIndex = nextSections.findIndex((section) => section.id === target.sectionId);

      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;

      const [movedSection] = nextSections.splice(sourceIndex, 1);
      nextSections.splice(targetIndex, 0, movedSection);
      setSections(nextSections);

      try {
        await persistSectionOrder(nextSections);
      } catch {
        setSections(previousSections);
        showListOrderErrorToast();
      }

      return;
    }

    const sourceSection = nextSections.find((section) => section.id === source.sectionId);
    const targetSectionId = target.sectionId;
    const targetSection = nextSections.find((section) => section.id === targetSectionId);

    if (!sourceSection || !targetSection) return;

    const sourceListIndex = sourceSection.lists.findIndex((list) => list.id === source.listId);
    if (sourceListIndex < 0) return;

    const [movedList] = sourceSection.lists.splice(sourceListIndex, 1);
    let targetListIndex =
      target.type === "list"
        ? targetSection.lists.findIndex((list) => list.id === target.listId)
        : targetSection.lists.length;

    if (targetListIndex < 0) targetListIndex = targetSection.lists.length;
    targetSection.lists.splice(targetListIndex, 0, movedList);
    setSections(nextSections);

    try {
      await persistListOrder(nextSections, [...new Set([source.sectionId, targetSectionId])]);
    } catch {
      setSections(previousSections);
      showListOrderErrorToast();
    }
  };

  const hasLists = () => sections().some((section) => section.lists.length > 0);

  return (
    <Show when={Array.isArray(loadedSections())} fallback={<FallbackLoadingLists />}>
      <Show when={hasLists() || sections().length > 0} fallback={<FallbackNoLists />}>
        <DragDropProvider onDragEnd={handleDragEnd}>
          <div class="space-y-8">
            <For each={sections()}>{(section) => <ListSection section={section} />}</For>
          </div>
        </DragDropProvider>
      </Show>
    </Show>
  );
};

export default ListSectionsBoard;
