import { rm } from "node:fs/promises";

import { ipcMain } from "electron";

import { MyDatabase } from "../database";
import { logging } from "../logging";
import { diddlImagesPath } from "../pathing";
import setupDiddlImages from "./setupDiddlImages";

export const GET_DIDDLS = "get-library";
export const FIX_DIDDL_IMAGES = "fix-diddl-images";

async function deleteDirectory(path: string) {
  try {
    await rm(path, { recursive: true, force: true });
    logging.info(`Directory ${path} deleted successfully.`);
    return { success: true };
  } catch (err) {
    logging.error(`Error deleting directory: ${err}`);
    return { success: false };
  }
}

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

  ipcMain.handle(FIX_DIDDL_IMAGES, async (_event) => {
    const deleteResult = await deleteDirectory(diddlImagesPath());

    if (!deleteResult.success) {
      return;
    }
    await setupDiddlImages();

    return { success: true };
  });
};

export default diddlMainHandlers;
