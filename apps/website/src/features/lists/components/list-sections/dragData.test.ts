import { describe, expect, it } from "vitest";

import type { AppList, AppSection } from "@/features/app-data";

import { moveList, moveSection, readDragData } from "./dragData";

const list = (id: number, sectionId: number): AppList => ({
  id,
  userId: "user_1",
  name: `List ${id}`,
  color: "oklch(77.2% 0.142 5.8)",
  sectionId,
  position: 0,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  deletedAt: null,
});

const section = (id: number, lists: AppList[], isDefault = false): AppSection => ({
  id,
  userId: "user_1",
  name: `Section ${id}`,
  position: 0,
  isDefault,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  deletedAt: null,
  lists,
});

const board = () => [
  section(1, [list(10, 1), list(11, 1)], true),
  section(2, [list(20, 2)]),
  section(3, []),
];

const ids = (sections: AppSection[]) => sections.map((s) => [s.id, s.lists.map((l) => l.id)]);

describe("readDragData", () => {
  it("reads a getter, a plain value, and rejects anything else", () => {
    const data = { type: "section", sectionId: 1 };
    expect(readDragData({ data: () => data })).toEqual(data);
    expect(readDragData({ data })).toEqual(data);
    expect(readDragData({ data: { current: data } })).toEqual(data);
    expect(readDragData({ data: "nope" })).toBeNull();
    expect(readDragData(undefined)).toBeNull();
  });
});

describe("moveSection", () => {
  it("moves the source into the target's slot without touching the input", () => {
    const input = board();
    expect(ids(moveSection(input, 3, 1)!)).toEqual([
      [3, []],
      [1, [10, 11]],
      [2, [20]],
    ]);
    expect(ids(input)).toEqual(ids(board()));
  });

  it("returns null when nothing moves", () => {
    expect(moveSection(board(), 1, 1)).toBeNull();
    expect(moveSection(board(), 1, 99)).toBeNull();
  });
});

describe("moveList", () => {
  it("reorders within a section by taking the target list's slot", () => {
    const next = moveList(
      board(),
      { type: "list", listId: 11, sectionId: 1 },
      {
        type: "list",
        listId: 10,
        sectionId: 1,
      },
    );
    expect(ids(next!)).toEqual([
      [1, [11, 10]],
      [2, [20]],
      [3, []],
    ]);
  });

  it("moves across sections, appending when dropped on the section itself", () => {
    const next = moveList(
      board(),
      { type: "list", listId: 10, sectionId: 1 },
      {
        type: "section",
        sectionId: 3,
      },
    );
    expect(ids(next!)).toEqual([
      [1, [11]],
      [2, [20]],
      [3, [10]],
    ]);
  });

  it("returns null for an unknown list or section", () => {
    expect(
      moveList(
        board(),
        { type: "list", listId: 99, sectionId: 1 },
        { type: "section", sectionId: 2 },
      ),
    ).toBeNull();
    expect(
      moveList(
        board(),
        { type: "list", listId: 10, sectionId: 1 },
        { type: "section", sectionId: 9 },
      ),
    ).toBeNull();
  });
});
