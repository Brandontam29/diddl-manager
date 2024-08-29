import { ipcRenderer } from 'electron';

import { GET_LIBRARY, GET_LIBRARY_INDEX_MAP, SET_LIBRARY } from './libraryMainHandlers';
import { LibraryEntry } from '../../shared/library-models';

const libraryPreloadApi = {
  setLibrary: (content: LibraryEntry[]) => ipcRenderer.invoke(SET_LIBRARY, content),
  getLibrary: (): Promise<LibraryEntry[] | Error> => ipcRenderer.invoke(GET_LIBRARY),
  getLibraryIndexMap: (): Promise<Record<string, number>> =>
    ipcRenderer.invoke(GET_LIBRARY_INDEX_MAP)
};

export default libraryPreloadApi;
