import { ipcRenderer } from "electron";

import { ZIP_AND_DOWNLOAD } from "./fileSystemMainHandlers";

const fileSystemPreloadApi = {
  downloadImages: (diddlIds: number[]): Promise<boolean> =>
    ipcRenderer.invoke(ZIP_AND_DOWNLOAD, diddlIds),
};

export default fileSystemPreloadApi;
