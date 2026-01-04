import { readdir } from "node:fs/promises";
import path from "node:path";
import { projectRoot } from "./pathing";

/**
 * Counts all files in a directory and its subdirectories.
 * @param dirPath - The root directory to start counting from.
 * @returns The total number of files found.
 */
async function countFilesRecursive(dirPath: string): Promise<number> {
    try {
        // Setting recursive: true returns all files and folders in the tree
        // Setting withFileTypes: true allows us to filter out directories
        const entries = await readdir(dirPath, {
            recursive: true,
            withFileTypes: true,
        });

        // Filter to only include entries that are files
        const fileCount = entries.filter((entry) => entry.isFile()).length;

        return fileCount;
    } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
        return 0;
    }
}

// Example Usage:
const dirPath = path.join(projectRoot(), "complete-raw-static-files");
const totalFiles = await countFilesRecursive(dirPath);

const imageUrls = (await Bun.file(
    path.join(projectRoot(), "json-files", "image-urls.json")
).json()) as Record<string, string[]>;

const numOfImages = Object.keys(imageUrls).reduce((a, key) => {
    return a + imageUrls[key].length;
}, 0);
console.log(`Total images in "image-urls.json": ${numOfImages}`);
console.log(`Total files in "${dirPath}": ${totalFiles}`);
