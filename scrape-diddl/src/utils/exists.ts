import { accessSync, constants } from "node:fs";
import { access } from "node:fs/promises";

export const exists = async (path: string): Promise<boolean> => {
    try {
        await access(path, constants.F_OK);
        return true;
    } catch {
        return false;
    }
};

export const existsSync = (path: string): boolean => {
    try {
        accessSync(path, constants.F_OK);
        return true;
    } catch {
        return false;
    }
};

export default exists;
