import { describe, expect, it } from "vitest";

import {
  buildImportPlan,
  DEFAULT_SECTION,
  type DesktopSnapshot,
  type DesktopSqlite,
  normalizeDesktopImagePath,
  parseDesktopTimestamp,
  parseSqliteBoolean,
  readDesktopSnapshot,
} from "./import-desktop-rules";

const ISO = "2025-03-04T05:06:07.000Z";

// Fixtures use the real on-disk encoding: the desktop's Kysely serialize plugin
// writes booleans as the TEXT strings 'true' / 'false'.
const section = (over: Partial<DesktopSnapshot["sections"][number]> = {}) => ({
  id: 2,
  name: "Favourites",
  position: 1,
  is_default: "false",
  created_at: ISO,
  updated_at: ISO,
  deleted_at: null,
  ...over,
});
const defaultSection = section({ id: 1, name: "Unsectioned", position: 0, is_default: "true" });
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
  is_damaged: "true",
  is_incomplete: "false",
  ...over,
});
const diddl = (id: number, image_path: string | null = `app://diddl-images/dir\\${id}.jpg`) => ({
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

describe("parseSqliteBoolean", () => {
  it("decodes the desktop's text encoding, integers, booleans, and null", () => {
    for (const truthy of ["true", "1", 1, true]) expect(parseSqliteBoolean(truthy)).toBe(true);
    for (const falsy of ["false", "0", 0, false, null, undefined]) {
      expect(parseSqliteBoolean(falsy)).toBe(false);
    }
  });

  it("passes anything else through for zod to reject", () => {
    expect(parseSqliteBoolean("yes")).toBe("yes");
    expect(parseSqliteBoolean(2)).toBe(2);
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
    expect(plan.defaultSectionPosition).toBe(0);
    expect(plan.lists.map((l) => [l.desktopId, l.section, l.position])).toEqual([[10, 2, 0]]);
    expect(plan.items).toEqual([
      { desktopListId: 10, diddlId: 1, quantity: 2, isDamaged: true, isIncomplete: false },
    ]);
    expect(plan.remappedListIds).toEqual([]);
  });

  it("recognizes the default section by its 'true' text flag and folds it into the web one", () => {
    const plan = buildImportPlan(snapshot({ lists: [list({ section_id: 1 })] }), catalog);
    expect(plan.sections.map((s) => s.desktopId)).toEqual([2]);
    expect(plan.lists[0]?.section).toBe(DEFAULT_SECTION);
    // Its lists were already in the default section: not a remap, position kept.
    expect(plan.remappedListIds).toEqual([]);
    expect(plan.lists[0]?.position).toBe(0);
  });

  it("accepts 0/1 for is_default too", () => {
    const plan = buildImportPlan(
      snapshot({ sections: [section({ id: 1, is_default: 1 }), section({ is_default: 0 })] }),
      catalog,
    );
    expect(plan.sections.map((s) => s.desktopId)).toEqual([2]);
  });

  it("renumbers sections in desktop order around the Default Section", () => {
    const plan = buildImportPlan(
      snapshot({
        sections: [
          section({ id: 5, name: "Last", position: 7 }),
          section({ id: 1, name: "Unsectioned", position: 3, is_default: "true" }),
          section({ id: 4, name: "First", position: 2 }),
          section({ id: 9, name: "Gone", position: 1, deleted_at: ISO }),
        ],
        lists: [],
        items: [],
      }),
      catalog,
    );
    expect(plan.violations).toEqual([]);
    expect(plan.sections.map((s) => [s.desktopId, s.position])).toEqual([
      [4, 0],
      [5, 2],
    ]);
    expect(plan.defaultSectionPosition).toBe(1);
  });

  it("reports no Default Section slot when the desktop has no default section", () => {
    const plan = buildImportPlan(
      snapshot({ sections: [section()], lists: [], items: [] }),
      catalog,
    );
    expect(plan.defaultSectionPosition).toBeNull();
  });

  it("sends lists with a null, deleted, or unknown section to the Default Section, appended after its own lists", () => {
    const plan = buildImportPlan(
      snapshot({
        sections: [defaultSection, section(), section({ id: 3, name: "Gone", deleted_at: ISO })],
        lists: [
          list({ id: 10, section_id: null, position: 0 }),
          list({ id: 11, section_id: 3, position: 0 }),
          list({ id: 12, section_id: 99, position: 5 }),
          list({ id: 13, section_id: 2, position: 0 }),
          list({ id: 14, section_id: 1, position: 4 }),
          list({ id: 15, section_id: 1, position: 2 }),
        ],
        items: [],
      }),
      catalog,
    );
    expect(plan.violations).toEqual([]);
    expect(plan.skipped.sections).toBe(1);
    expect(plan.remappedListIds).toEqual([10, 11, 12]);
    const byId = new Map(plan.lists.map((l) => [l.desktopId, [l.section, l.position]]));
    expect(byId.get(13)).toEqual([2, 0]);
    // Desktop-default lists keep their positions (max 4); orphans follow in desktop order.
    expect(byId.get(15)).toEqual([DEFAULT_SECTION, 2]);
    expect(byId.get(14)).toEqual([DEFAULT_SECTION, 4]);
    expect(byId.get(10)).toEqual([DEFAULT_SECTION, 5]);
    expect(byId.get(11)).toEqual([DEFAULT_SECTION, 6]);
    expect(byId.get(12)).toEqual([DEFAULT_SECTION, 7]);
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

  it("decodes item flags in every encoding and applies SQLite defaults for nulls", () => {
    const plan = buildImportPlan(
      snapshot({
        items: [
          item({ id: 100, is_damaged: "true", is_incomplete: "false" }),
          item({ id: 101, is_damaged: 0, is_incomplete: 1 }),
          item({ id: 102, quantity: null, is_damaged: null, is_incomplete: null }),
        ],
      }),
      catalog,
    );
    expect(plan.violations).toEqual([]);
    expect(plan.items.map((i) => [i.quantity, i.isDamaged, i.isIncomplete])).toEqual([
      [2, true, false],
      [2, false, true],
      [1, false, false],
    ]);
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
        items: [
          item({ list_id: 12, quantity: 0 }),
          item({ id: 101, list_id: 12, is_damaged: "maybe" }),
          item({ id: 102, list_id: 11 }),
        ],
      }),
      catalog,
    );
    expect(plan.violations).toEqual([
      expect.stringContaining("section 2"),
      expect.stringContaining("list 10"),
      'list 11 ("Stickers"): created_at: unparseable timestamp "nope"',
      expect.stringContaining("list_item 100"),
      expect.stringContaining("list_item 101: isDamaged"),
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

  it("checks each referenced diddl once, with forward-slash paths accepted too", () => {
    const plan = buildImportPlan(
      snapshot({
        items: [item(), item({ id: 101 })],
        diddls: [diddl(1, "app://diddl-images/dir/1.jpg")],
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
