import { ipcRenderer } from "electron";

import {
  GET_TRACKER_LIST,
  SET_LIST_ITEMS,
  ADD_LIST_ITEMS,
  REMOVE_LIST_ITEMS,
  GET_LIST,
  CREATE_LIST,
  DELETE_LIST,
  UPDATE_LIST_NAME,
} from "./listMainHandlers";
import type { ListItem, TrackerListItem } from "../../shared";

const listPreloadApi = {
  getLists: (): Promise<TrackerListItem[]> => ipcRenderer.invoke(GET_TRACKER_LIST),

  setListItems: (listId: string, items: ListItem[]): Promise<ListItem[] | undefined> =>
    ipcRenderer.invoke(SET_LIST_ITEMS, listId, items),
  addListItems: (listId: string, items: ListItem[]): Promise<ListItem[] | undefined> =>
    ipcRenderer.invoke(ADD_LIST_ITEMS, listId, items),
  removeListItems: (listId: string, idsToRemove: string[]): Promise<ListItem[] | undefined> =>
    ipcRenderer.invoke(REMOVE_LIST_ITEMS, listId, idsToRemove),

  getListItems: (listId: string): Promise<ListItem[] | undefined> =>
    ipcRenderer.invoke(GET_LIST, listId),
  createList: (listName: string, ddidlIds: string[]): Promise<TrackerListItem> =>
    ipcRenderer.invoke(CREATE_LIST, listName, ddidlIds),
  deleteList: (listId: string): Promise<TrackerListItem> => ipcRenderer.invoke(DELETE_LIST, listId),
  setList: (listId: string, content: ListItem[]): Promise<ListItem[] | undefined> =>
    ipcRenderer.invoke(SET_LIST_ITEMS, listId, content),
  updateListName: (listId: string, newListName: string): Promise<ListItem | undefined> =>
    ipcRenderer.invoke(UPDATE_LIST_NAME, listId, newListName),
};

export default listPreloadApi;
