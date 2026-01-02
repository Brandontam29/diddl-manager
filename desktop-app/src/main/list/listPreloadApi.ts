import { ipcRenderer } from "electron";

import type { AddListItem, List, ListItem } from "../../shared";
import {
  ADD_LIST_ITEMS,
  CREATE_LIST,
  DELETE_LIST,
  GET_LISTS,
  GET_LIST_ITEMS,
  REMOVE_LIST_ITEMS,
  UPDATE_LIST_ITEMS,
  UPDATE_LIST_NAME,
} from "./listMainHandlers";

const listPreloadApi = {
  //List
  createList: (listName: string, ddidlIds: number[]): Promise<List> =>
    ipcRenderer.invoke(CREATE_LIST, listName, ddidlIds),

  getLists: (): Promise<List[]> => ipcRenderer.invoke(GET_LISTS),

  deleteList: (listId: number): Promise<void> => ipcRenderer.invoke(DELETE_LIST, listId),

  updateListName: (listId: number, newListName: string): Promise<void> =>
    ipcRenderer.invoke(UPDATE_LIST_NAME, listId, newListName),

  // List Items
  getListItems: (listId: number): Promise<ListItem[] | null> =>
    ipcRenderer.invoke(GET_LIST_ITEMS, listId),

  addListItems: (listId: number, payload: AddListItem[]): Promise<{ success: boolean }> =>
    ipcRenderer.invoke(ADD_LIST_ITEMS, listId, payload),

  removeListItems: (listId: number, idsToRemove: number[]): Promise<{ success: boolean }> =>
    ipcRenderer.invoke(REMOVE_LIST_ITEMS, listId, idsToRemove),

  updateListItems: (
    listId: number,
    listItemIds: number[],
    action: {
      addQuantity?: number;
      isDamaged?: boolean;
      isIncomplete?: boolean;
    },
  ): Promise<{ success: boolean; data?: { numUpdatedRows: number; numDeletedRows: number } }> =>
    ipcRenderer.invoke(UPDATE_LIST_ITEMS, listId, listItemIds, action),
};

export default listPreloadApi;
