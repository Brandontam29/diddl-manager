import { ipcRenderer } from "electron";

import { Diddl } from "../../shared/diddl-models";
import { GET_DIDDLS } from "./diddlMainHandlers";

const diddlPreloadApi = {
  getDiddls: (): Promise<Diddl[] | Error> => ipcRenderer.invoke(GET_DIDDLS),
};

export default diddlPreloadApi;
