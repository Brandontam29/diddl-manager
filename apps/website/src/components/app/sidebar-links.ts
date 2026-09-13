import { DIDDL_TYPES, type DiddlType } from "@/shared";

export type SidebarTypeLink = { label: string; search: { type: DiddlType } };

/** One entry per Diddl Type — a type added to the schema fails to compile here. */
const LABELS = {
  A7: "A7",
  A6: "A6",
  A5: "A5",
  A4: "A4",
  series: "Series",
  "gift-paper": "Gift Paper",
  birthday: "Birthday",
  special: "Special",
  game: "Game",
  A2: "A2",
  "paper-relief": "Paper Relief",
  "post-it": "Post-It",
  "rectangular-memo": "Rectangular Memo",
  "square-memo": "Square Memo",
  "quardiddl-card": "Quardiddl Card",
  "letter-paper": "Letter Paper",
  stamp: "Stamp",
  "paper-bag-A5": "Paper Bag A5",
  "paper-bag-A4": "Paper Bag A4",
  "paper-bag-expo": "Paper Bag Expo",
  "bag-small": "Small Bag",
  "bag-large": "Large Bag",
  "bag-mega": "Mega Bag",
  "bag-plastic": "Plastic Bag",
  sticker: "Sticker",
  "postal-card": "Postal cards",
  towel: "Towel",
} satisfies Record<DiddlType, string>;
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

export const SIDEBAR_LINKS: SidebarTypeLink[] = [
  ...ORDER,
  ...DIDDL_TYPES.filter((type) => !ORDER.includes(type)),
].map((type) => ({ label: LABELS[type], search: { type } }));
