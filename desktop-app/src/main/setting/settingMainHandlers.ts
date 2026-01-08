import { type BrowserWindow, ipcMain } from "electron";
import type ElectronStore from "electron-store";

import { type Settings, settingsSchema } from "../../shared/settings-schema";
import { type UiState, uiStateSchema } from "../../shared/ui-state-schema";

export const GET_SETTINGS = "get-settings";
export const UPDATE_SETTING = "update-setting";
export const GET_UI_STATE = "get-ui-state";
export const UPDATE_UI_STATE = "update-ui-state";

const settingMainHandlers = (
  _browserWindow: BrowserWindow,
  store: ElectronStore<Settings>,
  uiStore: ElectronStore<UiState>,
) => {
  // --- Settings ---
  ipcMain.handle(GET_SETTINGS, async (_event) => {
    const parseResult = await settingsSchema.partial().safeParseAsync(store.store);
    return parseResult;
  });

  ipcMain.handle(UPDATE_SETTING, async (_event, newSettings: DeepPartial<Settings>) => {
    const currentSettings = store.store;
    const currentClone = JSON.parse(JSON.stringify(currentSettings));
    const mergedPreview = deepMerge(currentClone, newSettings);
    const parseResult = await settingsSchema.safeParseAsync(mergedPreview);

    if (!parseResult.success) {
      return { success: false, error: parseResult.error };
    }

    store.store = parseResult.data;
    return { success: true, data: store.store };
  });

  // --- UI State ---
  ipcMain.handle(GET_UI_STATE, async (_event) => {
    const parseResult = await uiStateSchema.partial().safeParseAsync(uiStore.store);
    return parseResult;
  });

  ipcMain.handle(UPDATE_UI_STATE, async (_event, newUiState: DeepPartial<UiState>) => {
    const currentState = uiStore.store;
    const currentClone = JSON.parse(JSON.stringify(currentState));
    const mergedPreview = deepMerge(currentClone, newUiState);
    const parseResult = await uiStateSchema.safeParseAsync(mergedPreview);

    if (!parseResult.success) {
      return { success: false, error: parseResult.error };
    }

    uiStore.store = parseResult.data;
    return { success: true, data: uiStore.store };
  });
};

function deepMerge(target: any, source: any): any {
  if (
    typeof target !== "object" ||
    target === null ||
    typeof source !== "object" ||
    source === null
  ) {
    return source;
  }

  const result = { ...target };

  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }

  Object.assign(result || {}, source);

  return result;
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export default settingMainHandlers;
