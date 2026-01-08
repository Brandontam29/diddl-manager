import { ipcRenderer } from "electron";
import { ZodSafeParseResult } from "zod";

import { type Settings } from "../../shared/settings-schema";
import { type Settings as UiState } from "../../shared/ui-state-schema";
import {
  GET_SETTINGS,
  GET_UI_STATE,
  UPDATE_SETTING,
  UPDATE_UI_STATE,
} from "./settingMainHandlers";

// Define DeepPartial locally or import if we exported it from shared.
// Ideally shared should have it, but for now we define it here or use Partial.
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

const settingPreloadApi = {
  getSettings: (): Promise<ZodSafeParseResult<Settings>> => ipcRenderer.invoke(GET_SETTINGS),

  updateSetting: (newSettings: DeepPartial<Settings>): Promise<ZodSafeParseResult<Settings>> =>
    ipcRenderer.invoke(UPDATE_SETTING, newSettings),

  // UI State
  getUiState: (): Promise<ZodSafeParseResult<UiState>> => ipcRenderer.invoke(GET_UI_STATE),

  updateUiState: (newUiState: DeepPartial<UiState>): Promise<ZodSafeParseResult<UiState>> =>
    ipcRenderer.invoke(UPDATE_UI_STATE, newUiState),
};


export default settingPreloadApi;
