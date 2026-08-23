import type { AppSection } from "@/features/app-data";

export type DragData =
  | { type: "section"; sectionId: number }
  | { type: "list"; listId: number; sectionId: number };

export const cloneSections = (sections: AppSection[]) =>
  sections.map((section) => ({ ...section, lists: [...section.lists] }));

/** dnd-kit hands `data` back as a getter, a signal or a plain value depending on the entity. */
export const readDragData = (entity: unknown): DragData | null => {
  const data = (entity as { data?: unknown })?.data;
  const value =
    typeof data === "function"
      ? data()
      : ((data as { current?: unknown; value?: unknown })?.current ??
        (data as { value?: unknown })?.value ??
        data);

  if (typeof value !== "object" || value === null || !("type" in value)) return null;
  return value as DragData;
};

/** The section order after dragging one section onto another; `null` when nothing moves. */
export const moveSection = (
  sections: AppSection[],
  sourceSectionId: number,
  targetSectionId: number,
): AppSection[] | null => {
  const next = cloneSections(sections);
  const sourceIndex = next.findIndex((section) => section.id === sourceSectionId);
  const targetIndex = next.findIndex((section) => section.id === targetSectionId);

  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return null;

  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved!);
  return next;
};

/**
 * The board after dropping a list on another list (takes its slot) or on a section
 * (appended at the end) — cross-section moves included. `null` when nothing moves.
 */
export const moveList = (
  sections: AppSection[],
  source: Extract<DragData, { type: "list" }>,
  target: DragData,
): AppSection[] | null => {
  const next = cloneSections(sections);
  const sourceSection = next.find((section) => section.id === source.sectionId);
  const targetSection = next.find((section) => section.id === target.sectionId);

  if (!sourceSection || !targetSection) return null;

  const sourceListIndex = sourceSection.lists.findIndex((list) => list.id === source.listId);
  if (sourceListIndex < 0) return null;

  const [moved] = sourceSection.lists.splice(sourceListIndex, 1);
  let targetListIndex =
    target.type === "list"
      ? targetSection.lists.findIndex((list) => list.id === target.listId)
      : targetSection.lists.length;

  if (targetListIndex < 0) targetListIndex = targetSection.lists.length;
  targetSection.lists.splice(targetListIndex, 0, moved!);
  return next;
};
