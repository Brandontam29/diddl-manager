import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { fileSystemPreloadApi } from '../main/file-system'
import libraryPreloadApi from '../main/library/libraryPreloadApi'

// Custom APIs for renderer
const api = { ...fileSystemPreloadApi, ...libraryPreloadApi }

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.

export type Api = typeof api

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
