import type { ListSectionWithLists } from "@shared";

export type DragData =
  | { type: "section"; sectionId: number }
  | { type: "list"; listId: number; sectionId: number };

export const cloneSections = (sections: ListSectionWithLists[]) =>
  sections.map((section) => ({ ...section, lists: [...section.lists] }));

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
