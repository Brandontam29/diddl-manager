import { ipcMain } from "electron";
import { readFile, rename, writeFile } from "fs/promises";

import getFileContent from "./getFileContent";
import AdmZip from "adm-zip";
import path from "path";
import { idsToIndexes } from "../library";
import { defaultZipPath, downloadsFolder, libraryPath, rendererDirectory } from "../pathing";
import { LibraryEntry } from "../../shared";
import { log } from "../logging";
import isExists from "../utils/isExists";

export const GET_FILE_CONTENT = "get-file-content";
export const EDIT_FILE_CONTENT = "edit-file-content";
export const ZIP_AND_DOWNLOAD = "zip-and-download";

const zipFiles = async (filePaths: string[], outputZipPath: string) => {
  return new Promise((resolve, reject) => {
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

const fileSystemMainHandlers = () => {
  ipcMain.handle(GET_FILE_CONTENT, (_event, path: string) => {
    return getFileContent(path);
  });

  ipcMain.handle(EDIT_FILE_CONTENT, (_event, path: string, content: string) => {
    writeFile(path, content);
  });

  ipcMain.handle(ZIP_AND_DOWNLOAD, async (_event, diddlIds: string[]) => {
    const rawLibrary = await readFile(libraryPath(), "utf8");

    const libraryEntries = JSON.parse(rawLibrary) as LibraryEntry[];

    const imagePaths = idsToIndexes(diddlIds)
      .filter((index) => index !== undefined)
      .map((index) => path.join(rendererDirectory(), libraryEntries[index].imagePath));

    const zipFilename = `diddl-images-${imagePaths.length}.zip`;
    const zipFilePath = defaultZipPath(zipFilename);

    console.log(imagePaths);

    const result = await zipFiles(imagePaths, zipFilePath);

    await rename(zipFilePath, path.join(downloadsFolder(), zipFilename));

    log.info(`moved ${zipFilePath} to ${path.join(downloadsFolder(), zipFilename)}`);
    return result;
  });
};

export default fileSystemMainHandlers;
