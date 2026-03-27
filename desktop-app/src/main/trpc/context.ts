import type { BrowserWindow } from "electron";

import type { MyDatabase } from "../database";

export type TrpcContext = {
  db: MyDatabase;
  browserWindow: BrowserWindow;
};
