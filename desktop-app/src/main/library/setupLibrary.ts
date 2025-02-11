import { readFile, rename, writeFile } from "fs/promises";
import { libraryEntrySchema } from "../../shared/library-models";
import { appPath, defaultLibraryPath, libraryPath, libraryMapPath } from "../pathing";
import isExists from "../utils/isExists";
import path from "path";
import { logging } from "../logging";
import isDev from "../utils/isDev";
import { app } from "electron";

const libraryBackupPath = () => path.join(appPath(), `${new Date().toISOString()}-library.json`);

const createDefaultLibrary = async () => {
  const rawLibrary = await readFile(defaultLibraryPath(), "utf8");

  const library = JSON.parse(rawLibrary);

  const libraryWithFullImagePaths = library.map((entry) => ({
    ...entry,
    imagePath: isDev()
      ? path.join(__dirname, "..", "renderer", "assets", entry.imagePath)
      : path.join(app.getAppPath(), "resources", "diddl-images", entry.imagePath),
  }));

  writeFile(libraryPath(), JSON.stringify(libraryWithFullImagePaths));
  setupLibraryMap(libraryWithFullImagePaths);
};

const setupLibrary = async () => {
  if (!(await isExists(libraryPath()))) {
    logging.info("library.json not found. Creating new library.json.");
    createDefaultLibrary();

    return;
  }

  try {
    const rawLibrary = await readFile(libraryPath(), "utf8");

    const library = JSON.parse(rawLibrary);

    libraryEntrySchema.array().parse(library);
    logging.info("Found library.json. Data is valid.");
  } catch (err) {
    logging.error(`Library corrupted. Backing up Library to ${libraryBackupPath()}`);
    await rename(libraryPath(), libraryBackupPath());
    createDefaultLibrary();
  }
};

const setupLibraryMap = (library: { id: string }[]) => {
  // id to index map

  const idToIndexmap = library.reduce((accumulator, diddl, index) => {
    accumulator[diddl.id] = index;

    return accumulator;
  }, {});

  writeFile(libraryMapPath(), JSON.stringify(idToIndexmap));
};

export default setupLibrary;
