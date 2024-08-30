import path from "path";
import fs from "fs";
import { logAllPaths } from "./logAllPaths";

export const projectRoot = () => {
    const rootMarker = "package.json"; // You can use any file or folder that reliably exists in your project root.

    let dir = __dirname;

    while (!fs.existsSync(path.join(dir, rootMarker))) {
        const parentDir = path.resolve(dir, "..");

        if (parentDir === dir) {
            throw new Error("Project root not found");
        }

        dir = parentDir;
    }

    return dir;
};
export const libraryPath = () => path.join(projectRoot(), "json-files", "library.json");

export const libaryMapPath = () =>
    path.join(projectRoot(), "json-files", "library-map.json");

export const libraryItemTypeMapPath = () =>
    path.join(projectRoot(), "json-files", "keys-map.json");

export const structurePath = () =>
    path.join(projectRoot(), "json-files", "structure.json");

export const libraryIndexMap = () =>
    path.join(projectRoot(), "json-files", "library-index-map.json");

export { logAllPaths };
