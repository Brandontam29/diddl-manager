import { ipcRenderer } from "electron";

import { Diddl } from "../../shared/diddl-models";
import { FIX_DIDDL_IMAGES, GET_DIDDLS } from "./diddlMainHandlers";

const diddlPreloadApi = {
  getDiddls: (): Promise<Diddl[] | Error> => ipcRenderer.invoke(GET_DIDDLS),
  fixDiddlImages: (): Promise<{ success: boolean }> => ipcRenderer.invoke(FIX_DIDDL_IMAGES),
};

export default diddlPreloadApi;
