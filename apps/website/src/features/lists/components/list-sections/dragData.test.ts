import { describe, expect, it } from "vitest";

import type { AppList, AppSection } from "@/features/app-data";

import { moveList, moveSection } from "./dragData";

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
  section(1, [list(10, 1), list(11, 1), list(12, 1)], true),
  section(2, [list(20, 2)]),
  section(3, []),
];

const ids = (sections: AppSection[]) => sections.map((s) => [s.id, s.lists.map((l) => l.id)]);

const onList = (listId: number, sectionId: number) => ({
  type: "list" as const,
  listId,
  sectionId,
});
const onSection = (sectionId: number) => ({ type: "section" as const, sectionId });

describe("moveSection", () => {
  it("moves the source into the target's slot without touching the input", () => {
    const input = board();
    expect(ids(moveSection(input, 3, 1)!)).toEqual([
      [3, []],
      [1, [10, 11, 12]],
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
  it("forward within a section: the source takes the target's slot", () => {
    expect(ids(moveList(board(), onList(10, 1), onList(12, 1))!)[0]).toEqual([1, [11, 12, 10]]);
    expect(ids(moveList(board(), onList(10, 1), onList(11, 1))!)[0]).toEqual([1, [11, 10, 12]]);
  });

  it("backward within a section", () => {
    expect(ids(moveList(board(), onList(12, 1), onList(10, 1))!)[0]).toEqual([1, [12, 10, 11]]);
    expect(ids(moveList(board(), onList(12, 1), onList(11, 1))!)[0]).toEqual([1, [10, 12, 11]]);
  });

  it("onto its own section appends at the end", () => {
    expect(ids(moveList(board(), onList(10, 1), onSection(1))!)[0]).toEqual([1, [11, 12, 10]]);
    expect(moveList(board(), onList(12, 1), onSection(1))).toBeNull();
  });

  it("across sections: onto a list takes its slot, onto a section appends", () => {
    expect(ids(moveList(board(), onList(20, 2), onList(11, 1))!)).toEqual([
      [1, [10, 20, 11, 12]],
      [2, []],
      [3, []],
    ]);
    expect(ids(moveList(board(), onList(10, 1), onSection(3))!)).toEqual([
      [1, [11, 12]],
      [2, [20]],
      [3, [10]],
    ]);
  });

  it("returns null for a self-drop, an unknown list or section, and leaves the input alone", () => {
    const input = board();
    expect(moveList(input, onList(10, 1), onList(10, 1))).toBeNull();
    expect(moveList(input, onList(99, 1), onSection(2))).toBeNull();
    expect(moveList(input, onList(10, 1), onSection(9))).toBeNull();
    expect(moveList(input, onList(10, 1), onList(99, 1))).toBeNull();
    expect(ids(input)).toEqual(ids(board()));
  });
});
