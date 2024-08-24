import { ipcMain } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import { LibraryEntry, libraryEntrySchema } from '../../shared/library-models'
import { libraryPath } from '../pathing'

export const SET_LIBRARY = 'set-library'
export const GET_LIBRARY = 'get-library'

const libraryMainHandlers = () => {
  ipcMain.handle(SET_LIBRARY, (_event, content: LibraryEntry[]) => {
    const libraryEntries = libraryEntrySchema.array().parse(content)

    writeFile(libraryPath(), JSON.stringify(libraryEntries))
  })

  ipcMain.handle(GET_LIBRARY, async (_event) => {
    const rawLibrary = await readFile(libraryPath(), 'utf8')

    const libraryEntries = JSON.parse(rawLibrary)

    return libraryEntries
  })
}

export default libraryMainHandlers
