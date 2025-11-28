import type { BrowserWindow } from "electron";
import { fileSystemMainHandlers } from "./file-system";
import { diddlMainHandlers } from "./diddl";
import { listMainHandlers } from "./list";
import { MyDatabase } from "./database";

const registerMainHandlers = (browserWindow: BrowserWindow, db: MyDatabase): void => {
  fileSystemMainHandlers(db);
  diddlMainHandlers(db);
  listMainHandlers(browserWindow, db);
};

export default registerMainHandlers;
