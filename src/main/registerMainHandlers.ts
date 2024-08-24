import { BrowserWindow } from 'electron'
import { fileSystemMainHandlers } from './file-system'
import libraryMainHandlers from './library/libraryMainHandlers'

const registerMainHandlers = (browserWindow: BrowserWindow): void => {
  fileSystemMainHandlers()
  libraryMainHandlers()
}

export default registerMainHandlers
