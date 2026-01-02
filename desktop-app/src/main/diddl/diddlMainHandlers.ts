import { ipcMain } from "electron";

import { MyDatabase } from "../database";

export const GET_DIDDLS = "get-library";
export const GET_LIBRARY_INDEX_MAP = "get-library-index-map";

const diddlMainHandlers = (db: MyDatabase) => {
  ipcMain.handle(GET_DIDDLS, (_event) => {
    const diddls = db
      .selectFrom("diddl")
      .select([
        "diddl.id",
        "diddl.name",
        "diddl.type",
        "diddl.imagePath",
        "diddl.imageWidth",
        "diddl.imageHeight",
      ])
      .execute();

    return diddls;
  });
};

export default diddlMainHandlers;
