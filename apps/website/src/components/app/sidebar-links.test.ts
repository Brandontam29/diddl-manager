import { describe, expect, it } from "vitest";

import { SIDEBAR_GROUPS } from "./sidebar-links";

describe("SIDEBAR_GROUPS", () => {
  it("keeps the desktop slice quirk: 100-199 is from=99&to=199", () => {
    const a6 = SIDEBAR_GROUPS.find((g) => g.title === "A6")!;
    expect(a6.links.map((l) => [l.label, l.search.from, l.search.to])).toEqual([
      ["1-99", 0, 99],
      ["100-199", 99, 199],
      ["200-299", 199, 299],
    ]);
  });

  it("labels the A7 slice 1-100 like the desktop", () => {
    const a7 = SIDEBAR_GROUPS.find((g) => g.title === "A7")!;
    expect(a7.links).toEqual([{ label: "1-100", search: { type: "A7", from: 0, to: 99 } }]);
  });

  it("has the desktop's 27 groups", () => {
    expect(SIDEBAR_GROUPS).toHaveLength(27);
  });
});
