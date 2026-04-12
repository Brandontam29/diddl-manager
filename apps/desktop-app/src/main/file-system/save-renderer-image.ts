import { copyFile } from "node:fs/promises";
import path from "node:path";

import { ResultAsync } from "neverthrow";

import { ensureDirExists } from "../utils/ensure-dir-exists";

export const saveRendererImage = (
  imagePath: string,
  destinationDir: string,
): ResultAsync<string, Error> => {
  return ensureDirExists(destinationDir).andThen(() => {
    const fileName = `user-file-${Date.now()}${path.extname(imagePath)}`;
    const destinationPath = path.join(destinationDir, fileName);

    // Wrap copyFile in ResultAsync to keep the chain consistent
    return ResultAsync.fromPromise(
      copyFile(imagePath, destinationPath),
      (err) => new Error(`Failed to copy image: ${String(err)}`),
    ).map(() => destinationPath); // Return the path on success
  });
};
