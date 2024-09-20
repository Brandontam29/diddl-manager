import { ipcRenderer } from "electron";

import { GET_LIBRARY, GET_LIBRARY_INDEX_MAP } from "./libraryMainHandlers";
import type { LibraryEntry } from "../../shared/library-models";

const libraryPreloadApi = {
  getLibrary: (): Promise<LibraryEntry[] | Error> => ipcRenderer.invoke(GET_LIBRARY),
  getLibraryIndexMap: (): Promise<Record<string, number>> =>
    ipcRenderer.invoke(GET_LIBRARY_INDEX_MAP),
};

export default libraryPreloadApi;
