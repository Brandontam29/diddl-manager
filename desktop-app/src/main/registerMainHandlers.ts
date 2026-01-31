import type { BrowserWindow } from "electron";

import { configMainHandlers } from "./config";
import { MyDatabase } from "./database";
import { diddlMainHandlers } from "./diddl";
import { fileSystemMainHandlers } from "./file-system";
import { listMainHandlers } from "./list";
import { profileMainHandlers } from "./profile";

const registerMainHandlers = (browserWindow: BrowserWindow, db: MyDatabase): void => {
  configMainHandlers();
  diddlMainHandlers(db);
  fileSystemMainHandlers(db);
  listMainHandlers(browserWindow, db);
  profileMainHandlers(db);
};

export default registerMainHandlers;
