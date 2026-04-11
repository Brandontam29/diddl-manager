import { PathLike, accessSync, constants } from "node:fs";
import { access } from "node:fs/promises";

export const exists = async (path: PathLike): Promise<boolean> => {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

export const existsSync = (path: PathLike): boolean => {
  try {
    accessSync(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

export default exists;
