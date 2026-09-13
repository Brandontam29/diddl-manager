import { describe, expect, it } from "vitest";

import { DIDDL_TYPES } from "@/shared";

import { SIDEBAR_LINKS } from "./sidebar-links";

describe("SIDEBAR_LINKS", () => {
  it("has exactly one link per Diddl Type, A7 first like the desktop", () => {
    const types = SIDEBAR_LINKS.map((link) => link.search.type);
    expect(new Set(types).size).toBe(DIDDL_TYPES.length);
    expect(types).toHaveLength(DIDDL_TYPES.length);
    expect(SIDEBAR_LINKS[0]).toEqual({ label: "A7", search: { type: "A7" } });
  });
});
