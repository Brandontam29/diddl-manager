import { ipcMain } from "electron";
import { readFile } from "fs/promises";
import { libraryMapPath, libraryPath } from "../pathing";

export const GET_LIBRARY = "get-library";
export const GET_LIBRARY_INDEX_MAP = "get-library-index-map";

const libraryMainHandlers = () => {
  ipcMain.handle(GET_LIBRARY, async (_event) => {
    const rawLibrary = await readFile(libraryPath(), "utf8");

    const libraryEntries = JSON.parse(rawLibrary);

    return libraryEntries;
  });
  ipcMain.handle(GET_LIBRARY_INDEX_MAP, async (_event) => {
    const rawLibraryMap = await readFile(libraryMapPath(), "utf8");

    const libraryMap = JSON.parse(rawLibraryMap);

    return libraryMap;
  });
};

export default libraryMainHandlers;
