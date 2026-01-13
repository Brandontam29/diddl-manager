import { ipcMain } from "electron";

import { uiStateSchema } from "../../shared";
import { Settings, settingsSchema } from "../../shared/";
import { settingsPath, uiStatePath } from "../pathing";
import { YamlHandler } from "./yaml-handler";

export const GET_SETTINGS = "get-settings";
export const UPDATE_SETTING = "update-setting";
export const GET_UI_STATE = "get-ui-state";
export const UPDATE_UI_STATE = "update-ui-state";

export const configMainHandlers = () => {
  const settingsDocument = new YamlHandler(settingsSchema, settingsPath());
  const uiStateDocument = new YamlHandler(uiStateSchema, uiStatePath());

  // --- Settings ---
  ipcMain.handle(GET_SETTINGS, async (_event) => {
    const result = await settingsDocument.read();
    return result.match(
      (data) => ({ success: true, data }),
      (e) => {
        console.error(e);
        return { success: false, error: e };
      },
    );
  });

  ipcMain.handle(UPDATE_SETTING, async (_event, keyPath: string[], value: any) => {
    const result = await settingsDocument.update(keyPath, value);
    return result.match(
      () => ({ success: true }),
      (e) => {
        console.error(e);
        return { success: false, error: e };
      },
    );
  });

  // --- UI State ---
  ipcMain.handle(GET_UI_STATE, async (_event) => {
    const result = await uiStateDocument.read();
    return result.match(
      (data) => ({ success: true, data }),
      (e) => {
        console.error(e);
        return { success: false, error: e };
      },
    );
  });

  ipcMain.handle(UPDATE_UI_STATE, async (_event, keyPath: string[], value: any) => {
    const result = await uiStateDocument.update(keyPath, value);
    return result.match(
      () => ({ success: true }),
      (e) => {
        console.error(e);
        return { success: false, error: e };
      },
    );
  });
};
