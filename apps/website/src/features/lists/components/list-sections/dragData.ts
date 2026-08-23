import type { AppSection } from "@/features/app-data";

export type DragData =
  | { type: "section"; sectionId: number }
  | { type: "list"; listId: number; sectionId: number };

const cloneSections = (sections: AppSection[]) =>
  sections.map((section) => ({ ...section, lists: [...section.lists] }));

const sameOrder = (a: AppSection[], b: AppSection[]) =>
  a.length === b.length &&
  a.every(
    (section, i) =>
      section.id === b[i]!.id &&
      section.lists.length === b[i]!.lists.length &&
      section.lists.every((list, j) => list.id === b[i]!.lists[j]!.id),
  );

/** The section order after dragging one section onto another; `null` when nothing moves. */
export const moveSection = (
  sections: AppSection[],
  sourceSectionId: number,
  targetSectionId: number,
): AppSection[] | null => {
  const sourceIndex = sections.findIndex((section) => section.id === sourceSectionId);
  const targetIndex = sections.findIndex((section) => section.id === targetSectionId);

  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return null;

  const next = cloneSections(sections);
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved!);
  return next;
};

/**
 * The board after dropping a list on another list (lands in that list's slot, the
 * target shifting aside) or on a section (appended at the end) — cross-section moves
 * included. `null` when nothing moves: unknown ids, a drop on its own card (dnd-kit
 * does not exclude the co-located droppable), or an order identical to the current.
 */
export const moveList = (
  sections: AppSection[],
  source: Extract<DragData, { type: "list" }>,
  target: DragData,
): AppSection[] | null => {
  if (target.type === "list" && target.listId === source.listId) return null;

  const next = cloneSections(sections);
  const sourceSection = next.find((section) => section.id === source.sectionId);
  const targetSection = next.find((section) => section.id === target.sectionId);
  if (!sourceSection || !targetSection) return null;

  const sourceIndex = sourceSection.lists.findIndex((list) => list.id === source.listId);
  if (sourceIndex < 0) return null;

  // The slot is resolved before the source leaves, like `moveSection`.
  const targetIndex =
    target.type === "list"
      ? targetSection.lists.findIndex((list) => list.id === target.listId)
      : targetSection.lists.length;
  if (targetIndex < 0) return null;

  const [moved] = sourceSection.lists.splice(sourceIndex, 1);
  targetSection.lists.splice(targetIndex, 0, moved!);

  return sameOrder(sections, next) ? null : next;
};
