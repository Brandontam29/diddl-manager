import { ipcRenderer } from "electron";

import { EDIT_FILE_CONTENT, GET_FILE_CONTENT, ZIP_AND_DOWNLOAD } from "./fileSystemMainHandlers";

const fileSystemPreloadApi = {
  downloadImages: (diddlIds: string[]): Promise<boolean> =>
    ipcRenderer.invoke(ZIP_AND_DOWNLOAD, diddlIds),
  getFileContent: (path: string): Promise<string> => ipcRenderer.invoke(GET_FILE_CONTENT, path),
  editFileContent: (path: string, content: string): Promise<string> =>
    ipcRenderer.invoke(EDIT_FILE_CONTENT, path, content),
};

export default fileSystemPreloadApi;
