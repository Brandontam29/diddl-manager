import { describe, expect, it } from "vitest";

import type { Diddl, JoinedListItem } from "@/shared";

import {
  filterItemsByCatalogSlice,
  hasCatalogSlice,
  hasListStateFilters,
  isShowAllMode,
  listSearchSchema,
  mergeCatalogWithItems,
  toListItemFilter,
} from "./listSearch";

const diddl = (id: number, type: Diddl["type"] = "A7"): Diddl => ({
  id,
  name: `Diddl ${id}`,
  type,
  imagePath: "",
});

const item = (listItemId: number, diddlId: number): JoinedListItem => ({
  listItemId,
  listId: 1,
  diddlId,
  quantity: 1,
  isDamaged: false,
  isIncomplete: false,
  diddlName: `Diddl ${diddlId}`,
  diddlType: "A7",
  imagePath: "",
});

describe("listSearchSchema", () => {
  it("accepts the router's parsed values", () => {
    expect(
      listSearchSchema.parse({ showAll: true, isDamaged: false, minCount: 2, maxCount: 5 }),
    ).toEqual({ showAll: true, isDamaged: false, minCount: 2, maxCount: 5 });
    expect(listSearchSchema.parse({ type: "A6", from: 99, to: 199 })).toEqual({
      type: "A6",
      from: 99,
      to: 199,
    });
    expect(listSearchSchema.parse({})).toEqual({});
  });

  it("drops invalid values instead of failing or coercing", () => {
    expect(
      listSearchSchema.parse({ type: "A3", showAll: "yes", minCount: "", maxCount: "lots" }),
    ).toEqual({});
    expect(listSearchSchema.parse({ isDamaged: "true", minCount: -1, maxCount: 1.5 })).toEqual({});
  });
});

describe("toListItemFilter", () => {
  it("returns undefined without filters and drops the client-only params", () => {
    expect(toListItemFilter({})).toBeUndefined();
    expect(toListItemFilter({ showAll: true, from: 0, to: 99 })).toBeUndefined();
  });

  it("carries the server-side filters through", () => {
    expect(toListItemFilter({ type: "A6", isDamaged: true, minCount: 1, maxCount: 3 })).toEqual({
      type: "A6",
      isDamaged: true,
      minCount: 1,
      maxCount: 3,
    });
  });
});

describe("show-all mode", () => {
  it("is on only with showAll and no list-state filter", () => {
    expect(isShowAllMode({ showAll: true })).toBe(true);
    expect(isShowAllMode({ showAll: true, type: "A7" })).toBe(true);
    expect(isShowAllMode({ showAll: true, isDamaged: false })).toBe(false);
    expect(isShowAllMode({})).toBe(false);
    expect(hasListStateFilters({ maxCount: 2 })).toBe(true);
    expect(hasListStateFilters({ type: "A7", from: 1 })).toBe(false);
  });

  it("replaces owned Diddls by their List Items and keeps the rest at zero", () => {
    const catalog = [diddl(1), diddl(2, "A6"), diddl(3)];
    const items = [item(10, 3), item(11, 3)];

    expect(mergeCatalogWithItems(catalog, items, {})).toEqual([
      diddl(1),
      diddl(2, "A6"),
      item(10, 3),
      item(11, 3),
    ]);
    expect(mergeCatalogWithItems(catalog, items, { type: "A7", from: 1 })).toEqual([
      item(10, 3),
      item(11, 3),
    ]);
  });
});

describe("catalog slice", () => {
  it("keeps only the List Items whose Diddl sits in the sidebar's slice", () => {
    const catalog = [diddl(1), diddl(2), diddl(3), diddl(4)];
    const items = [item(10, 1), item(11, 3), item(12, 3), item(13, 4)];

    expect(filterItemsByCatalogSlice(catalog, items, {})).toBe(items);
    expect(filterItemsByCatalogSlice(catalog, items, { type: "A7", from: 1, to: 3 })).toEqual([
      item(11, 3),
      item(12, 3),
    ]);
  });

  it("matches what Show all renders for the owned Diddls", () => {
    const catalog = [diddl(1), diddl(2), diddl(3)];
    const items = [item(10, 1), item(11, 3)];
    const search = { type: "A7" as const, from: 1 };

    const owned = filterItemsByCatalogSlice(catalog, items, search);
    expect(mergeCatalogWithItems(catalog, owned, search)).toEqual([diddl(2), item(11, 3)]);
  });

  it("is set by any of type / from / to", () => {
    expect(hasCatalogSlice({})).toBe(false);
    expect(hasCatalogSlice({ showAll: true, isDamaged: true })).toBe(false);
    expect(hasCatalogSlice({ type: "A6" })).toBe(true);
    expect(hasCatalogSlice({ to: 99 })).toBe(true);
  });
});
