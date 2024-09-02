import { BrowserWindow, ipcMain } from 'electron';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { ListItem, listItemSchema, listNameSchema } from '../../shared';
import { listDirectory } from '../pathing';
import path from 'path';
import { nanoid } from 'nanoid';
import { createList, deleteList, getList, getLists, updateListName } from './listTrackerMethods';
import { validateDiddlIds } from '../library';
import { logging } from '../logging';
import isExists from '../utils/isExists';

export const GET_TRACKER_LIST = 'get-tracker-list';
export const CREATE_LIST = 'create-list';
export const SET_LIST = 'set-list';
export const GET_LIST = 'get-list';
export const DELETE_LIST = 'delete-list';
export const UPDATE_LIST_NAME = 'update-list-name';

const listMainHandlers = (browserWindow: BrowserWindow) => {
  ipcMain.handle(GET_LIST, async (_event, listId: string) => {
    const list = await getList(listId);

    if (!list) {
      logging.warn('list not found ', listId);
      return;
    }

    const rawlistEntries = await readFile(list.filePath, 'utf8');

    const listEntries = JSON.parse(rawlistEntries) as ListItem[];

    return listEntries;
  });

  ipcMain.handle(GET_TRACKER_LIST, async (_event) => {
    const lists = await getLists();

    if (lists.length === 0) logging.warn('no lists found');

    return lists;
  });
  ipcMain.handle(CREATE_LIST, async (_event, listName: string, ddidlIds: string[]) => {
    listNameSchema.parse(listName);
    const result = validateDiddlIds(ddidlIds);

    if (!result.allStatus) {
      logging.warn('invalid diddl ids sent to CREATE_LIST', result.invalidDiddlIds);
    }

    if (!(await isExists(listDirectory()))) {
      await mkdir(listDirectory(), { recursive: true });
    }

    const jsonFilename = nanoid(14);
    const jsonFilepath = path.join(listDirectory(), `${jsonFilename}.json`);
    const parsedItems = listItemSchema.array().parse(result.validDiddlIds.map((id) => ({ id })));
    await writeFile(jsonFilepath, JSON.stringify(parsedItems));

    return createList({ name: listName, filePath: jsonFilepath });
  });

  ipcMain.handle(SET_LIST, async (_event, listId: string, content: ListItem[]) => {
    const listItems = listItemSchema.array().parse(content);

    const diddlStatus = validateDiddlIds(listItems.map((item) => item.id));

    const validDiddls = diddlStatus.status
      .map((status, i) => (status ? listItems[i] : null))
      .filter((item) => item !== null);

    const list = await getList(listId);

    if (!list) {
      logging.warn('list not found ', listId);
      return;
    }

    await writeFile(list.filePath, JSON.stringify(validDiddls));

    return true;
  });

  ipcMain.handle(DELETE_LIST, async (_event, listId: string) => {
    const list = await deleteList(listId);

    if (!list) {
      logging.warn('list not found ', listId);
      return;
    }

    return list;
  });
  ipcMain.handle(UPDATE_LIST_NAME, async (_event, listId: string, newListName: string) => {
    return updateListName(listId, newListName);
  });
};

export default listMainHandlers;
