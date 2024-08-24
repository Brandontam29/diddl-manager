import { ipcRenderer } from 'electron'

import { GET_LIBRARY, SET_LIBRARY } from './libraryMainHandlers'
import { LibraryEntry } from '../../shared/library-models'

const libraryPreloadApi = {
  setLibrary: (content: LibraryEntry[]) => ipcRenderer.invoke(SET_LIBRARY, content),
  getLibrary: (): Promise<LibraryEntry[] | Error> => ipcRenderer.invoke(GET_LIBRARY)
}

export default libraryPreloadApi
