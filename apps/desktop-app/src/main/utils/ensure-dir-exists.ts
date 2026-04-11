import { mkdir } from "node:fs/promises";

import { ResultAsync } from "neverthrow";

import { logging } from "../logging";

export const ensureDirExists = (dirPath: string) => {
  return ResultAsync.fromPromise(mkdir(dirPath, { recursive: true }), (err) => {
    const error = err instanceof Error ? err : new Error(String(err));

    logging.error(`Error creating directories: ${error.message}`);

    return error;
  }).map(() => {});
};
