import { rename } from "node:fs/promises";
import path from "path";

import { ipcMain } from "electron";

import { MyDatabase } from "../database";
import { logging } from "../logging";
import { defaultZipPath, downloadsFolder } from "../pathing";
import { createBackupZip } from "./zip/createBackupZip";

export const GET_FILE_CONTENT = "get-file-content";
export const EDIT_FILE_CONTENT = "edit-file-content";
export const ZIP_AND_DOWNLOAD = "zip-and-download";

const fileSystemMainHandlers = (db: MyDatabase) => {
  ipcMain.handle(ZIP_AND_DOWNLOAD, async (_event, diddlIds: number[]) => {
    const imagePaths = await db
      .selectFrom("diddl")
      .select(["diddl.imagePath"])
      .where("diddl.id", "in", diddlIds)
      .execute();

    const timestamp = new Date().toISOString().replaceAll(":", "-");
    const zipFilename = `diddl-images-${imagePaths.length}-${timestamp}.zip`;
    const zipFilePath = defaultZipPath(zipFilename);

    const result = await createBackupZip(
      imagePaths.map((imgPath) => imgPath.imagePath),
      zipFilePath,
    );

    if (!result.success) {
      return result;
    }

    const destPath = path.join(downloadsFolder(), zipFilename);
    await rename(zipFilePath, destPath);
    logging.info(`moved ${zipFilePath} to ${destPath}`);

    return result;
  });
};

export default fileSystemMainHandlers;
