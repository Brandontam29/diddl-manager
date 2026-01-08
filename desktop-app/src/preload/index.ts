import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge } from "electron";

import { diddlPreloadApi } from "../main/diddl";
import { fileSystemPreloadApi } from "../main/file-system";
import { listPreloadApi } from "../main/list";
import { settingPreloadApi } from "../main/setting";

// Custom APIs for renderer
const api = {
  ...fileSystemPreloadApi,
  ...diddlPreloadApi,
  ...listPreloadApi,
  ...settingPreloadApi,
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.

export type Api = typeof api;

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-expect-error (define in dts)
  window.electron = electronAPI;
  // @ts-expect-error (define in dts)
  window.api = api;
}
