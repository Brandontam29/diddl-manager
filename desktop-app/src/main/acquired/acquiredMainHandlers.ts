import { ipcMain } from 'electron';
import { readFile, writeFile } from 'fs/promises';
import { AcquiredItem, acquiredItemSchema } from '../../shared';
import { acquiredListPath } from '../pathing';

export const SET_ACQUIRED_LIST = 'set-acquired-list';
export const GET_ACQUIRED_LIST = 'get-acquired-list';
export const ADD_ACQUIRED_ITEMS = 'add-acquired-items';

const acquiredMainHandlers = () => {
  ipcMain.handle(SET_ACQUIRED_LIST, (_event, content: AcquiredItem[]) => {
    const acquiredListEntries = acquiredItemSchema.array().parse(content);

    writeFile(acquiredListPath(), JSON.stringify(acquiredListEntries));
  });

  ipcMain.handle(GET_ACQUIRED_LIST, async (_event) => {
    const rawAcquiredList = await readFile(acquiredListPath(), 'utf8');

    const acquiredListEntries = JSON.parse(rawAcquiredList);

    return acquiredListEntries;
  });
  // ipcMain.handle(
  //   ADD_ACQUIRED_ITEMS,
  //   async (_event, diddlIds: string[], options: Partial<Omit<AcquiredItem, 'id'>>) => {
  //     const rawAcquiredList = await readFile(acquiredListPath(), 'utf8');

  //     const acquiredListEntries = JSON.parse(rawAcquiredList);

  //     return acquiredListEntries;
  //   }
  // );
};

export default acquiredMainHandlers;
