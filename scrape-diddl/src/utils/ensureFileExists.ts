import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ensureFileExists = async (filePath: string, defaultContent = "") => {
    const dir = path.dirname(filePath);

    try {
        await mkdir(dir, { recursive: true });
    } catch (err) {
        if (!(err instanceof Error)) {
            console.error(`Error creating directories: ${err}`);
            return;
        }

        console.error(`Error creating directories: ${err.message}`);
        return;
    }
    try {
        await writeFile(filePath, defaultContent);
    } catch (err) {
        if (!(err instanceof Error)) {
            console.error(`Error creating file: ${err}`);
            return;
        }

        console.error(`Error creating file: ${err.message}`);
    }
};

export const ensureDirExists = async (dirPath: string) => {
    try {
        await mkdir(dirPath, { recursive: true });
    } catch (err) {
        if (!(err instanceof Error)) {
            console.error(`Error creating directories: ${err}`);
            return;
        }

        console.error(`Error creating directories: ${err.message}`);
        return;
    }
};

export default ensureFileExists;
