import type { Diddl, JoinedListItem, ListItem } from "@shared";

export type DiddlCardItem = Diddl | JoinedListItem | (Diddl & { listItem?: ListItem });

export const isJoinedListItem = (item: DiddlCardItem): item is JoinedListItem =>
  "listItemId" in item;

export const getCardItemId = (item: DiddlCardItem) =>
  isJoinedListItem(item) ? `list-item:${item.listItemId}` : `diddl:${item.id}`;

export const getCardItemDiddlId = (item: DiddlCardItem) =>
  isJoinedListItem(item) ? item.diddlId : item.id;

export const getCardItemListItemId = (item: DiddlCardItem) => {
  if (isJoinedListItem(item)) return item.listItemId;
  if ("listItem" in item) return item.listItem?.id ?? null;
  return null;
};

export const getCardItemName = (item: DiddlCardItem) =>
  isJoinedListItem(item) ? item.diddlName : item.name;

export const getCardItemQuantity = (item: DiddlCardItem) => {
  if (isJoinedListItem(item)) return item.quantity;
  if ("listItem" in item) return item.listItem?.quantity ?? 0;
  return 0;
};
