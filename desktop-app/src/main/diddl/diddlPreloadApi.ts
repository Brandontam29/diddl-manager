import { ipcRenderer } from "electron";

import { GET_DIDDLS } from "./diddlMainHandlers";
import { Diddl } from "../../shared/diddl-models";

const diddlPreloadApi = {
  getDiddls: (): Promise<Diddl[] | Error> => ipcRenderer.invoke(GET_DIDDLS),
};

export default diddlPreloadApi;
