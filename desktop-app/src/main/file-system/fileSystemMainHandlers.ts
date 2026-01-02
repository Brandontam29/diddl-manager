import { rename } from "node:fs/promises";
import path from "node:path";

import AdmZip from "adm-zip";
import { ipcMain } from "electron";

import { MyDatabase } from "../database";
import { log } from "../logging";
import { defaultZipPath, downloadsFolder } from "../pathing";
import exists from "../utils/exists";

export const GET_FILE_CONTENT = "get-file-content";
export const EDIT_FILE_CONTENT = "edit-file-content";
export const ZIP_AND_DOWNLOAD = "zip-and-download";

const zipFiles = async (filePaths: string[], outputZipPath: string): Promise<boolean> => {
  const zip = new AdmZip();

  const existenceChecks = await Promise.all(
    filePaths.map(async (p) => ({ path: p, exists: await exists(p) })),
  );

  const validFiles = existenceChecks.filter((f) => f.exists).map((f) => f.path);

  if (validFiles.length === 0) {
    log.error("No valid files found to zip.");
    return false;
  }

  for (const filePath of validFiles) {
    try {
      zip.addLocalFile(filePath, "");
    } catch (err) {
      log.warn(`Failed to add ${filePath} to zip:`, err);
    }
  }

  return new Promise<boolean>((resolve) => {
    zip.writeZip(outputZipPath, (error) => {
      if (error) {
        log.error(`Zip writing failed at ${outputZipPath}:`, error);
        resolve(false);
      } else {
        log.info(`Zip file created successfully at ${outputZipPath}`);
        resolve(true);
      }
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
