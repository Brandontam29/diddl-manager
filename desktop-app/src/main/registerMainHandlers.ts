import type { BrowserWindow } from "electron";
import { type Settings } from "../shared/settings-schema";
import { type Settings as UiState } from "../shared/ui-state-schema";
import type ElectronStore from "electron-store";

import { MyDatabase } from "./database";
import { diddlMainHandlers } from "./diddl";
import { fileSystemMainHandlers } from "./file-system";
import { listMainHandlers } from "./list";
import { settingMainHandlers } from "./setting";

const registerMainHandlers = (
  browserWindow: BrowserWindow,
  db: MyDatabase,
  store: ElectronStore<Settings>,
  uiStore: ElectronStore<UiState>,
): void => {
  fileSystemMainHandlers(db);
  diddlMainHandlers(db);
  listMainHandlers(browserWindow, db);
  settingMainHandlers(browserWindow, store, uiStore);
};

export default registerMainHandlers;
