import { readFile, rename } from "fs/promises";
import { listItemSchema } from "../../shared";
import { appPath, collectionListPath, listTrackerPath } from "../pathing";
import { isExistsSync } from "../utils/isExists";
import path from "path";
import { logging } from "../logging";
import ensureFileExists from "../utils/ensureFileExists";
import { createList } from "./listTrackerMethods";

const listBackupPath = () => path.join(appPath(), `${new Date().toISOString()}-list-tracker.json`);

const setupListTracker = async () => {
  if (!isExistsSync(listTrackerPath())) {
    logging.info("list-tracker.json not found. Creating new list-tracker.json.");
    await ensureFileExists(listTrackerPath(), "[]");
    await createList({ name: "Collection", filePath: collectionListPath() });
    return;
  }

  try {
    const rawlist = await readFile(listTrackerPath(), "utf8");

    const list = JSON.parse(rawlist);

    listItemSchema.array().parse(list);
    logging.info("Found list-tracker.json. Data is valid.");
  } catch (err) {
    logging.error(`list corrupted. Backing up list to ${listBackupPath()}`);
    await rename(listTrackerPath(), listBackupPath());
    await ensureFileExists(listTrackerPath(), "[]");
    await createList({ name: "Collection", filePath: collectionListPath() });
  }
};

export default setupListTracker;
