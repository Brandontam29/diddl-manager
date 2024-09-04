import type { BrowserWindow } from "electron";
import { fileSystemMainHandlers } from "./file-system";
import { libraryMainHandlers } from "./library";
import { listMainHandlers } from "./list";

const registerMainHandlers = (browserWindow: BrowserWindow): void => {
  fileSystemMainHandlers();
  libraryMainHandlers();
  listMainHandlers(browserWindow);
};

export default registerMainHandlers;
