import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { logging } from "../logging";

const ensureFileExists = async (filePath: string, defaultContent = "") => {
  const dir = path.dirname(filePath);

  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    if (!(err instanceof Error)) {
      logging.error(`Error creating directories: ${err}`);
      return;
    }

    logging.error(`Error creating directories: ${err.message}`);
    return;
  }
  try {
    await writeFile(filePath, defaultContent);
  } catch (err) {
    if (!(err instanceof Error)) {
      logging.error(`Error creating file: ${err}`);
      return;
    }

    logging.error(`Error creating file: ${err.message}`);
  }
};

export default ensureFileExists;
