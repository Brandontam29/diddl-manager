import { ipcRenderer } from "electron";
import { ZodError, ZodSafeParseResult } from "zod";

import { IpcResponse } from "../../shared";
import { type Settings } from "../../shared/settings-schema";
import { type UiState } from "../../shared/ui-state-schema";
import { GET_SETTINGS, GET_UI_STATE, UPDATE_SETTING, UPDATE_UI_STATE } from "./configMainHandlers";

export const configPreloadApi = {
  getSettings: (): Promise<ZodSafeParseResult<Settings>> => ipcRenderer.invoke(GET_SETTINGS),

  updateSetting: (newSettings): Promise<IpcResponse<void, ZodError<Settings>>> =>
    ipcRenderer.invoke(UPDATE_SETTING, newSettings),

  // UI State
  getUiState: (): Promise<ZodSafeParseResult<UiState>> => ipcRenderer.invoke(GET_UI_STATE),

  updateUiState: (newUiState): Promise<IpcResponse<void, ZodError<UiState>>> =>
    ipcRenderer.invoke(UPDATE_UI_STATE, newUiState),
};
