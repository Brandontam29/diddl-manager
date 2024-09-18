import type { ListItem } from "@shared";
import { listStore, setListStore } from "./createListsStore";

export const fetchListItems = async (listId: string) => {
  const listItems = await window.api.getListItems(listId);

  setListStore("listItems", listItems);
};

export const setListItems = (listId: string, listItems: ListItem[]) => {
  setListStore("listItems", listItems);
  window.api.setList(listId, listItems);
};

export const addListItems = async (
  listId: string,
  diddlIds: string[],
  state?: Partial<Omit<ListItem, "id">>,
) => {
  const defaultState = { isDamaged: false, isIncomplete: false, count: 1 } satisfies Omit<
    ListItem,
    "id"
  >;

  const listItemsToAdd = diddlIds.map((id) => ({ id: id, ...defaultState, ...state }));

  const completeListItems = await window.api.addListItems(listId, listItemsToAdd);

  if (completeListItems === undefined) {
    return; //toast
  }
};

export const removeListItems = async (listId: string, idsToRemove: string[]) => {
  if (listStore.listItems === undefined) return; //toast

  const listItems = listStore.listItems.filter((diddl) => !idsToRemove.includes(diddl.id));

  setListStore("listItems", listItems);
  window.api.setList(listId, listItems);
};

export const updateListItems = async (
  listId: string,
  itemIds: string[],
  action: {
    addCount?: number;
    isDamaged?: boolean;
    isIncomplete?: boolean;
  },
) => {
  if (!listStore.listItems) return;

  const newListItems = listStore.listItems.map((listItem) => {
    const item = { ...listItem };
    const itemIdIndex = itemIds.indexOf(item.id);
    if (itemIdIndex === -1) return item; // Item not in itemIds, no changes

    if (action.addCount !== undefined) item.count += action.addCount;
    if (action.isDamaged !== undefined) item.isDamaged = action.isDamaged;
    if (action.isIncomplete !== undefined) item.isIncomplete = action.isIncomplete;

    // Remove the processed item from itemIds
    itemIds.splice(itemIdIndex, 1);

    return item;
  });

  setListStore("listItems", newListItems);
  window.api.setList(listId, newListItems);
};
