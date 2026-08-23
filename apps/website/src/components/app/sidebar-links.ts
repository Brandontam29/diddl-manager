import type { DiddlType } from "@/shared";

export type SidebarSliceLink = {
  label: string;
  search: { type: DiddlType; from: number; to: number };
};

export type SidebarGroup = { title: string; links: SidebarSliceLink[] };

/**
 * Builds the per-type slice links. Desktop quirk kept verbatim (spec §6): the first
 * slice is `from=0&to=99` (labelled "1-100" for A7, "1-99" elsewhere) and every later
 * slice starts at the previous `to` — so "100-199" is `from=99&to=199`.
 */
const slices = (type: DiddlType, count: number, firstLabel = "1-99"): SidebarSliceLink[] =>
  Array.from({ length: count }, (_, i) => ({
    label: i === 0 ? firstLabel : `${i * 100}-${i * 100 + 99}`,
    search: { type, from: i === 0 ? 0 : i * 100 - 1, to: i * 100 + 99 },
  }));

export const SIDEBAR_GROUPS: SidebarGroup[] = [
  { title: "A7", links: slices("A7", 1, "1-100") },
  { title: "A6", links: slices("A6", 3) },
  { title: "A5", links: slices("A5", 5) },
  { title: "A4", links: slices("A4", 2) },
  { title: "Series", links: slices("series", 2) },
  { title: "Gift Paper", links: slices("gift-paper", 3) },
  { title: "Birthday", links: slices("birthday", 1) },
  { title: "Special", links: slices("special", 1) },
  { title: "Game", links: slices("game", 1) },
  { title: "A2", links: slices("A2", 1) },
  { title: "Paper Relief", links: slices("paper-relief", 1) },
  { title: "Post-It", links: slices("post-it", 1) },
  { title: "Rectangular Memo", links: slices("rectangular-memo", 1) },
  { title: "Square Memo", links: slices("square-memo", 1) },
  { title: "Quardiddl Card", links: slices("quardiddl-card", 1) },
  { title: "Letter Paper", links: slices("letter-paper", 3) },
  { title: "Stamp", links: slices("stamp", 1) },
  { title: "Paper Bag A5", links: slices("paper-bag-A5", 1) },
  { title: "Paper Bag A4", links: slices("paper-bag-A4", 1) },
  { title: "Paper Bag Expo", links: slices("paper-bag-expo", 1) },
  { title: "Small Bag", links: slices("bag-small", 1) },
  { title: "Large Bag", links: slices("bag-large", 1) },
  { title: "Mega Bag", links: slices("bag-mega", 1) },
  { title: "Plastic Bag", links: slices("bag-plastic", 1) },
  { title: "Sticker", links: slices("sticker", 3) },
  { title: "Postal cards", links: slices("postal-card", 3) },
  { title: "Towel", links: slices("towel", 1) },
];
