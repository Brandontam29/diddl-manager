import { ipcMain } from "electron";
import { rename } from "fs/promises";

import AdmZip from "adm-zip";
import path from "path";
import { defaultZipPath, downloadsFolder } from "../pathing";
import { log } from "../logging";
import isExists from "../utils/isExists";
import { MyDatabase } from "../database";

export const GET_FILE_CONTENT = "get-file-content";
export const EDIT_FILE_CONTENT = "edit-file-content";
export const ZIP_AND_DOWNLOAD = "zip-and-download";

const zipFiles = async (filePaths: string[], outputZipPath: string) => {
  return new Promise<boolean>((resolve, reject) => {
    const zip = new AdmZip();

    filePaths.forEach(async (filePath) => {
      if (await isExists(filePath)) zip.addLocalFile(filePath); // Add file to zip
    });

    // Write the zip file to the specified output path
    zip.writeZip(outputZipPath, (errorOrNull) => {
      log.info(errorOrNull);
      if (errorOrNull) {
        log.error(errorOrNull);
        reject(false);
      }

      log.info(`Zip file created at ${outputZipPath}`);
      resolve(true);
    });
  });
};

const fileSystemMainHandlers = (db: MyDatabase) => {
  // ipcMain.handle(GET_FILE_CONTENT, (_event, path: string) => {
  //   return getFileContent(path);
  // });

  // ipcMain.handle(EDIT_FILE_CONTENT, (_event, path: string, content: string) => {
  //   writeFile(path, content);
  // });

  ipcMain.handle(ZIP_AND_DOWNLOAD, async (_event, diddlIds: number[]) => {
    const imagePaths = await db
      .selectFrom("diddl")
      .select(["diddl.imagePath"])
      .where("diddl.id", "in", diddlIds)
      .execute();

    const zipFilename = `diddl-images-${imagePaths.length}.zip`;
    const zipFilePath = defaultZipPath(zipFilename);

    const result = await zipFiles(
      imagePaths.map((imgPath) => imgPath.imagePath),
      zipFilePath,
    );

    await rename(zipFilePath, path.join(downloadsFolder(), zipFilename));

    log.info(`moved ${zipFilePath} to ${path.join(downloadsFolder(), zipFilename)}`);
    return result;
  });
};

export default fileSystemMainHandlers;
