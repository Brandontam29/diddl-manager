import { describe, expect, it } from "vitest";

import {
  buildImportPlan,
  DEFAULT_SECTION,
  type DesktopSnapshot,
  type DesktopSqlite,
  normalizeDesktopImagePath,
  parseDesktopTimestamp,
  readDesktopSnapshot,
} from "./import-desktop-rules";

const ISO = "2025-03-04T05:06:07.000Z";

const section = (over: Partial<DesktopSnapshot["sections"][number]> = {}) => ({
  id: 2,
  name: "Favourites",
  position: 1,
  is_default: 0,
  created_at: ISO,
  updated_at: ISO,
  deleted_at: null,
  ...over,
});
const defaultSection = section({ id: 1, name: "Unsectioned", position: 0, is_default: 1 });
const list = (over: Partial<DesktopSnapshot["lists"][number]> = {}) => ({
  id: 10,
  name: "Stickers",
  color: "oklch(77.2% 0.142 5.8)",
  section_id: 2,
  position: 0,
  created_at: ISO,
  updated_at: ISO,
  deleted_at: null,
  ...over,
});
const item = (over: Partial<DesktopSnapshot["items"][number]> = {}) => ({
  id: 100,
  list_id: 10,
  diddl_id: 1,
  quantity: 2,
  is_damaged: 1,
  is_incomplete: 0,
  ...over,
});
const diddl = (id: number, image_path: string | null = `app://diddl-images/dir/${id}.jpg`) => ({
  id,
  image_path,
});
const catalog = new Map([
  [1, "dir/1.jpg"],
  [2, "dir/2.jpg"],
  [3, "dir/3.jpg"],
]);

const snapshot = (over: Partial<DesktopSnapshot> = {}): DesktopSnapshot => ({
  sections: [defaultSection, section()],
  lists: [list()],
  items: [item()],
  diddls: [diddl(1), diddl(2), diddl(3)],
  ...over,
});

describe("normalizeDesktopImagePath", () => {
  it("strips the app scheme and forward-slashes backslashes", () => {
    expect(normalizeDesktopImagePath("app://diddl-images/012_Pimboli\\Blatt.jpg")).toBe(
      "012_Pimboli/Blatt.jpg",
    );
  });

  it("leaves an already-normalized path alone", () => {
    expect(normalizeDesktopImagePath("012_Pimboli/Blatt.jpg")).toBe("012_Pimboli/Blatt.jpg");
  });
});

describe("parseDesktopTimestamp", () => {
  it("reads SQLite's CURRENT_TIMESTAMP default as UTC", () => {
    expect(parseDesktopTimestamp("2025-03-04 05:06:07")?.toISOString()).toBe(ISO);
  });

  it("reads ISO strings and rejects garbage and null", () => {
    expect(parseDesktopTimestamp(ISO)?.toISOString()).toBe(ISO);
    expect(parseDesktopTimestamp("yesterday")).toBeNull();
    expect(parseDesktopTimestamp(null)).toBeNull();
  });
});

describe("buildImportPlan", () => {
  it("maps a clean snapshot with no violations", () => {
    const plan = buildImportPlan(snapshot(), catalog);
    expect(plan.violations).toEqual([]);
    expect(plan.sections).toEqual([
      {
        desktopId: 2,
        name: "Favourites",
        position: 1,
        createdAt: new Date(ISO),
        updatedAt: new Date(ISO),
      },
    ]);
    expect(plan.lists.map((l) => [l.desktopId, l.section])).toEqual([[10, 2]]);
    expect(plan.items).toEqual([
      { desktopListId: 10, diddlId: 1, quantity: 2, isDamaged: true, isIncomplete: false },
    ]);
    expect(plan.remappedListIds).toEqual([]);
  });

  it("folds the desktop default section into the web one", () => {
    const plan = buildImportPlan(snapshot({ lists: [list({ section_id: 1 })] }), catalog);
    expect(plan.sections.map((s) => s.desktopId)).toEqual([2]);
    expect(plan.lists[0]?.section).toBe(DEFAULT_SECTION);
    expect(plan.remappedListIds).toEqual([10]);
  });

  it("sends lists with a null, deleted, or unknown section to the Default Section", () => {
    const plan = buildImportPlan(
      snapshot({
        sections: [defaultSection, section(), section({ id: 3, name: "Gone", deleted_at: ISO })],
        lists: [
          list({ id: 10, section_id: null }),
          list({ id: 11, section_id: 3 }),
          list({ id: 12, section_id: 99 }),
          list({ id: 13, section_id: 2 }),
        ],
        items: [],
      }),
      catalog,
    );
    expect(plan.violations).toEqual([]);
    expect(plan.skipped.sections).toBe(1);
    expect(plan.lists.map((l) => l.section)).toEqual([
      DEFAULT_SECTION,
      DEFAULT_SECTION,
      DEFAULT_SECTION,
      2,
    ]);
    expect(plan.remappedListIds).toEqual([10, 11, 12]);
  });

  it("skips soft-deleted lists and the items of deleted or missing lists", () => {
    const plan = buildImportPlan(
      snapshot({
        lists: [list(), list({ id: 11, deleted_at: ISO })],
        items: [item(), item({ id: 101, list_id: 11 }), item({ id: 102, list_id: 42 })],
      }),
      catalog,
    );
    expect(plan.violations).toEqual([]);
    expect(plan.skipped).toEqual({ sections: 0, lists: 1, items: 2 });
    expect(plan.items).toHaveLength(1);
  });

  it("applies SQLite defaults for null quantity and flags", () => {
    const plan = buildImportPlan(
      snapshot({ items: [item({ quantity: null, is_damaged: null, is_incomplete: null })] }),
      catalog,
    );
    expect(plan.violations).toEqual([]);
    expect(plan.items[0]).toMatchObject({ quantity: 1, isDamaged: false, isIncomplete: false });
  });

  it("reports zod failures instead of throwing", () => {
    const plan = buildImportPlan(
      snapshot({
        sections: [defaultSection, section({ name: "x" })],
        lists: [
          list({ name: "fuck" }),
          list({ id: 11, section_id: null, created_at: "nope" }),
          list({ id: 12 }),
        ],
        items: [item({ list_id: 12, quantity: 0 }), item({ id: 101, list_id: 11 })],
      }),
      catalog,
    );
    expect(plan.violations).toEqual([
      expect.stringContaining("section 2"),
      expect.stringContaining("list 10"),
      'list 11 ("Stickers"): created_at: unparseable timestamp "nope"',
      expect.stringContaining("list_item 100"),
    ]);
    expect(plan.sections).toEqual([]);
    // The invalid section is gone, so list 12 falls back to the Default Section.
    expect(plan.lists.map((l) => [l.desktopId, l.section])).toEqual([[12, DEFAULT_SECTION]]);
    expect(plan.items).toEqual([]);
  });

  it("flags referenced diddls whose image differs from or is missing in the catalog", () => {
    const plan = buildImportPlan(
      snapshot({
        items: [
          item({ diddl_id: 1 }),
          item({ id: 101, diddl_id: 2 }),
          item({ id: 102, diddl_id: 4 }),
          item({ id: 103, diddl_id: 5 }),
        ],
        diddls: [diddl(1), diddl(2, "app://diddl-images/other\\2.jpg"), diddl(5)],
      }),
      catalog,
    );
    expect(plan.violations).toEqual([
      expect.stringContaining('diddl 2: desktop image "other/2.jpg" != catalog "dir/2.jpg"'),
      expect.stringContaining("diddl 4: referenced by a list item but absent"),
      expect.stringContaining("diddl 5: not in catalog.json"),
    ]);
  });

  it("checks each referenced diddl once, with backslash paths accepted", () => {
    const plan = buildImportPlan(
      snapshot({
        items: [item(), item({ id: 101 })],
        diddls: [diddl(1, "app://diddl-images/dir\\1.jpg")],
      }),
      catalog,
    );
    expect(plan.violations).toEqual([]);
    expect(plan.items).toHaveLength(2);
  });
});

describe("readDesktopSnapshot", () => {
  const fake = (tables: Record<string, unknown[]>): DesktopSqlite => ({
    query<T>(sqlText: string) {
      return {
        all: (): T[] => {
          if (sqlText.includes("sqlite_master")) {
            return Object.keys(tables).map((name) => ({ name })) as T[];
          }
          const table = /FROM (\w+)/.exec(sqlText)?.[1] ?? "";
          return (tables[table] ?? []) as T[];
        },
      };
    },
  });

  it("reads the four desktop tables", () => {
    const result = readDesktopSnapshot(
      fake({ diddl: [diddl(1)], list: [list()], list_item: [item()], list_section: [section()] }),
    );
    expect(result).toEqual({
      sections: [section()],
      lists: [list()],
      items: [item()],
      diddls: [diddl(1)],
    });
  });

  it("refuses a database that predates the list_section migration", () => {
    expect(() => readDesktopSnapshot(fake({ diddl: [], list: [], list_item: [] }))).toThrow(
      /missing table\(s\) list_section/,
    );
  });
});
