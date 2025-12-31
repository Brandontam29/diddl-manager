import type { AddListItem } from "@shared";
import { listStore, setListStore } from "./createListsStore";
import { reconcile } from "solid-js/store";

export const fetchListItems = async (listId: number) => {
  try {
    const listItems = await window.api.getListItems(listId);

    if (listItems === null) return;

    setListStore("listItems", reconcile(listItems));
  } catch (e) {
    console.error(e);
  }
};

export const addListItems = async (listId: number, diddlIds: number[], state?: AddListItem[]) => {
  const listItemsToAdd = diddlIds.map((id) => ({ diddlId: id, ...state }));

  const completeListItems = await window.api.addListItems(listId, listItemsToAdd);

  if (completeListItems === undefined) {
    return; //toast
  }
};

export const removeListItems = async (listId: number, idsToRemove: number[]) => {
  if (listStore.listItems === undefined) return; //toast

  return await window.api.removeListItems(listId, idsToRemove);
};

export const updateListItems = async (
  listId: number,
  listItemIds: number[],
  action: {
    addQuantity?: number;
    isDamaged?: boolean;
    isIncomplete?: boolean;
  },
) => {
  const result = await window.api.updateListItems(listId, listItemIds, action);

  // setListStore("users", [2, 7, 10], "loggedIn", false)

  if (result.success) {
    fetchListItems(listId);
  }

  return result;
};
