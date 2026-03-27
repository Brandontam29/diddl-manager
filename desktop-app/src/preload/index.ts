import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge } from "electron";
import { exposeElectronTRPC } from "electron-trpc/main";

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    exposeElectronTRPC();
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-expect-error (define in dts)
  window.electron = electronAPI;
}
