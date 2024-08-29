import { ipcMain } from 'electron';
import { readFile, writeFile } from 'fs/promises';
import { LibraryEntry, libraryEntrySchema } from '../../shared/library-models';
import { libraryMapPath, libraryPath } from '../pathing';

export const SET_LIBRARY = 'set-library';
export const GET_LIBRARY = 'get-library';
export const GET_LIBRARY_INDEX_MAP = 'get-library-index-map';

const libraryMainHandlers = () => {
  ipcMain.handle(SET_LIBRARY, (_event, content: LibraryEntry[]) => {
    const libraryEntries = libraryEntrySchema.array().parse(content);

    writeFile(libraryPath(), JSON.stringify(libraryEntries));
  });

  ipcMain.handle(GET_LIBRARY, async (_event) => {
    const rawLibrary = await readFile(libraryPath(), 'utf8');

    const libraryEntries = JSON.parse(rawLibrary);

    return libraryEntries;
  });
  ipcMain.handle(GET_LIBRARY_INDEX_MAP, async (_event) => {
    const rawLibraryMap = await readFile(libraryMapPath(), 'utf8');

    const libraryMap = JSON.parse(rawLibraryMap);

    return libraryMap;
  });
};

export default libraryMainHandlers;
