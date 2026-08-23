import { describe, expect, it } from "vitest";

import type { Diddl } from "@/shared";

import { filterCatalog, librarySearchSchema } from "./librarySearch";

const diddl = (id: number, type: Diddl["type"]): Diddl => ({
  id,
  name: `Diddl ${id}`,
  type,
  imagePath: "",
});

const catalog = [
  diddl(1, "A7"),
  diddl(2, "A6"),
  diddl(3, "A7"),
  diddl(4, "A7"),
  diddl(5, "sticker"),
];

describe("librarySearchSchema", () => {
  it("accepts the desktop's params and coerces numbers from strings", () => {
    expect(librarySearchSchema.parse({ type: "A6", from: "99", to: 199 })).toEqual({
      type: "A6",
      from: 99,
      to: 199,
    });
    expect(librarySearchSchema.parse({})).toEqual({});
  });

  it("drops unknown types and bad indices instead of failing the route", () => {
    expect(librarySearchSchema.parse({ type: "nope", from: -1, to: "x" })).toEqual({
      type: undefined,
      from: undefined,
      to: undefined,
    });
  });
});

describe("filterCatalog", () => {
  it("returns everything without params", () => {
    expect(filterCatalog(catalog, {})).toBe(catalog);
  });

  it("narrows by type, then slices by from/to", () => {
    expect(filterCatalog(catalog, { type: "A7" }).map((d) => d.id)).toEqual([1, 3, 4]);
    expect(filterCatalog(catalog, { type: "A7", from: 1, to: 2 }).map((d) => d.id)).toEqual([3]);
    expect(filterCatalog(catalog, { from: 3 }).map((d) => d.id)).toEqual([4, 5]);
    expect(filterCatalog(catalog, { to: 2 }).map((d) => d.id)).toEqual([1, 2]);
  });
});
