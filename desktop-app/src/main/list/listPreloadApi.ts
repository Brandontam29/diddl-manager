import { ipcRenderer } from 'electron';

import {
  GET_LIST,
  GET_TRACKER_LIST,
  CREATE_LIST,
  DELETE_LIST,
  SET_LIST,
  UPDATE_LIST_NAME
} from './listMainHandlers';
import { ListItem, TrackerListItem } from '../../shared';

const listPreloadApi = {
  getList: (listId: string): Promise<ListItem[] | undefined> =>
    ipcRenderer.invoke(GET_LIST, listId),
  getLists: (): Promise<TrackerListItem[]> => ipcRenderer.invoke(GET_TRACKER_LIST),
  createList: (listName: string, ddidlIds: string[]): Promise<TrackerListItem> =>
    ipcRenderer.invoke(CREATE_LIST, listName, ddidlIds),
  deleteList: (listId: string): Promise<TrackerListItem> => ipcRenderer.invoke(DELETE_LIST, listId),
  setList: (listId: string, content: ListItem[]): Promise<ListItem[] | Error> =>
    ipcRenderer.invoke(SET_LIST, listId, content),
  updateListName: (listId: string, newListName: string): Promise<ListItem | undefined> =>
    ipcRenderer.invoke(UPDATE_LIST_NAME, listId, newListName)
};

export default listPreloadApi;
