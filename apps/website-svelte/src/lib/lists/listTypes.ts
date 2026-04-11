/**
 * Shared types and constants for guest list management.
 * These contracts ensure that GuestListStore (localStorage) and future
 * ConvexListStore provide a consistent interface for UI components.
 */

export type ItemCondition = "mint" | "near_mint" | "good" | "poor" | "damaged";

export interface ConditionMetadata {
  label: string;
  color: string;
}

export const LIST_CONDITIONS: Record<ItemCondition, ConditionMetadata> = {
  mint: { label: "Mint", color: "bg-green-500" },
  near_mint: { label: "Near Mint", color: "bg-emerald-400" },
  good: { label: "Good", color: "bg-yellow-400" },
  poor: { label: "Poor", color: "bg-orange-400" },
  damaged: { label: "Damaged", color: "bg-red-500" },
};

export interface CatalogReference {
  type: string;
  number: number;
}

export interface GuestList {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface GuestListItem {
  id: string;
  listId: string;
  catalogRef: CatalogReference;
  condition: ItemCondition;
  quantity: number;
  complete: boolean;
  tags: string[];
}

/**
 * Natural key helper: type:number
 */
export function catalogKeyForReference(ref: CatalogReference): string {
  return `${ref.type}:${ref.number}`;
}

/**
 * Natural key helper: type:number -> { type, number }
 */
export function catalogReferenceFromKey(key: string): CatalogReference {
  const [type, numberStr] = key.split(":");
  return {
    type,
    number: parseInt(numberStr, 10),
  };
}

/**
 * Factory for default guest list
 */
export function createDefaultGuestList(overrides: Partial<GuestList> = {}): GuestList {
  return {
    id: crypto.randomUUID(),
    name: "My Collection",
    color: "#e11d48", // Default Berry color
    createdAt: Date.now(),
    ...overrides,
  };
}

/**
 * Factory for default guest list item
 */
export function createDefaultGuestListItem(
  listId: string,
  catalogRef: CatalogReference,
  overrides: Partial<GuestListItem> = {},
): GuestListItem {
  return {
    id: crypto.randomUUID(),
    listId,
    catalogRef,
    condition: "mint",
    quantity: 1,
    complete: true,
    tags: [],
    ...overrides,
  };
}

/**
 * Abstract ListStore interface.
 * UI components should code against this interface via getListStoreContext().
 */
export interface ListStore {
  readonly lists: GuestList[];
  readonly activeListId: string | null;
  readonly activeListItems: GuestListItem[];

  // List CRUD
  createList(name: string, color: string): GuestList;
  updateList(id: string, updates: Partial<Pick<GuestList, "name" | "color">>): void;
  deleteList(id: string): void;
  setActiveList(id: string | null): void;

  // Item CRUD
  addCatalogItems(listId: string, refs: CatalogReference[]): void;
  removeItems(itemIds: string[]): void;
  updateItems(
    itemIds: string[],
    updates: Partial<Pick<GuestListItem, "condition" | "quantity" | "complete">>,
  ): void;
  duplicateItems(itemIds: string[]): GuestListItem[];

  // Selectors
  getCompletionPercent(listId: string): number;
  getOwnedCatalogKeys(listId: string): Set<string>;
  getItemCount(listId: string): number;
  getOwnedCountByType(listId: string, type: string): number;
  getOwnedCountByRange(listId: string, type: string, start: number, end: number): number;
}
