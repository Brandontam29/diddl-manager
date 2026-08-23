import type { Diddl, JoinedListItem } from "@/shared";

/** A Library card (a Catalog `Diddl`) or a List-page card (a `JoinedListItem`). */
export type DiddlCardItem = Diddl | JoinedListItem;

export const isJoinedListItem = (item: DiddlCardItem): item is JoinedListItem =>
  "listItemId" in item;

export const getCardItemId = (item: DiddlCardItem) =>
  isJoinedListItem(item) ? `list-item:${item.listItemId}` : `diddl:${item.id}`;

export const getCardItemDiddlId = (item: DiddlCardItem) =>
  isJoinedListItem(item) ? item.diddlId : item.id;

export const getCardItemListItemId = (item: DiddlCardItem) =>
  isJoinedListItem(item) ? item.listItemId : null;

export const getCardItemName = (item: DiddlCardItem) =>
  isJoinedListItem(item) ? item.diddlName : item.name;

export const getCardItemQuantity = (item: DiddlCardItem) =>
  isJoinedListItem(item) ? item.quantity : 0;

/** Splits cards into the List Items they already are and the Catalog Diddls they are not yet. */
export const partitionCardItems = (items: DiddlCardItem[]) => {
  const listItemIds: number[] = [];
  const diddlIds: number[] = [];

  for (const item of items) {
    if (isJoinedListItem(item)) listItemIds.push(item.listItemId);
    else diddlIds.push(item.id);
  }

  return { listItemIds, diddlIds };
};
