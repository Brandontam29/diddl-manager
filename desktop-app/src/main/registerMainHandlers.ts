import type { BrowserWindow } from "electron";

import { MyDatabase } from "./database";
import { diddlMainHandlers } from "./diddl";
import { fileSystemMainHandlers } from "./file-system";
import { listMainHandlers } from "./list";

const registerMainHandlers = (browserWindow: BrowserWindow, db: MyDatabase): void => {
  fileSystemMainHandlers(db);
  diddlMainHandlers(db);
  listMainHandlers(browserWindow, db);
};

export default registerMainHandlers;
