import { DIDDL_TYPES, type DiddlType } from "@/shared";

export type SidebarSliceLink = {
  label: string;
  search: { type: DiddlType; from: number; to: number };
};

export type SidebarGroup = { title: string; links: SidebarSliceLink[] };

/**
 * Desktop quirk kept verbatim (spec §6): each slice of 100 starts one before its
 * label suggests, so "100-199" is `from=99&to=199`; only the first slice starts at 0.
 */
export const SLICE_SIZE = 100;
export const sliceRange = (index: number) => ({
  from: index === 0 ? 0 : index * SLICE_SIZE - 1,
  to: index * SLICE_SIZE + SLICE_SIZE - 1,
});

type GroupSpec = { title: string; slices: number; firstLabel?: string };

/** One entry per Diddl Type — a type added to the schema fails to compile here. */
const GROUPS = {
  A7: { title: "A7", slices: 1, firstLabel: "1-100" },
  A6: { title: "A6", slices: 3 },
  A5: { title: "A5", slices: 5 },
  A4: { title: "A4", slices: 2 },
  series: { title: "Series", slices: 2 },
  "gift-paper": { title: "Gift Paper", slices: 3 },
  birthday: { title: "Birthday", slices: 1 },
  special: { title: "Special", slices: 1 },
  game: { title: "Game", slices: 1 },
  A2: { title: "A2", slices: 1 },
  "paper-relief": { title: "Paper Relief", slices: 1 },
  "post-it": { title: "Post-It", slices: 1 },
  "rectangular-memo": { title: "Rectangular Memo", slices: 1 },
  "square-memo": { title: "Square Memo", slices: 1 },
  "quardiddl-card": { title: "Quardiddl Card", slices: 1 },
  "letter-paper": { title: "Letter Paper", slices: 3 },
  stamp: { title: "Stamp", slices: 1 },
  "paper-bag-A5": { title: "Paper Bag A5", slices: 1 },
  "paper-bag-A4": { title: "Paper Bag A4", slices: 1 },
  "paper-bag-expo": { title: "Paper Bag Expo", slices: 1 },
  "bag-small": { title: "Small Bag", slices: 1 },
  "bag-large": { title: "Large Bag", slices: 1 },
  "bag-mega": { title: "Mega Bag", slices: 1 },
  "bag-plastic": { title: "Plastic Bag", slices: 1 },
  sticker: { title: "Sticker", slices: 3 },
  "postal-card": { title: "Postal cards", slices: 3 },
  towel: { title: "Towel", slices: 1 },
} satisfies Record<DiddlType, GroupSpec>;

/** Sidebar order is the desktop's (A7 first), not the schema's. */
const ORDER: DiddlType[] = [
  "A7",
  "A6",
  "A5",
  "A4",
  "series",
  "gift-paper",
  "birthday",
  "special",
  "game",
  "A2",
  "paper-relief",
  "post-it",
  "rectangular-memo",
  "square-memo",
  "quardiddl-card",
  "letter-paper",
  "stamp",
  "paper-bag-A5",
  "paper-bag-A4",
  "paper-bag-expo",
  "bag-small",
  "bag-large",
  "bag-mega",
  "bag-plastic",
  "sticker",
  "postal-card",
  "towel",
];

const toGroup = (type: DiddlType): SidebarGroup => {
  const spec: GroupSpec = GROUPS[type];
  return {
    title: spec.title,
    links: Array.from({ length: spec.slices }, (_, i) => {
      const { from, to } = sliceRange(i);
      return {
        label: i === 0 ? (spec.firstLabel ?? "1-99") : `${i * SLICE_SIZE}-${to}`,
        search: { type, from, to },
      };
    }),
  };
};

export const SIDEBAR_GROUPS: SidebarGroup[] = [
  ...ORDER,
  ...DIDDL_TYPES.filter((type) => !ORDER.includes(type)),
].map(toGroup);
