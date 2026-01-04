import * as path from "path";
import { projectRoot } from "./pathing";
import writeJsonToFile from "./utils/writeJsonToFile";
import { readdir } from "fs/promises";

function getFilename(imageUrl: string, extname: string = "") {
    const originalFilename = path.basename(imageUrl);
    if (path.extname(originalFilename).length === 0) {
        return `${originalFilename}${extname}`;
    }
    return originalFilename;
}

async function getFiles(dirPath: string): Promise<string[]> {
    try {
        // Setting recursive: true will get all files in subdirectories
        const files = await readdir(dirPath, { recursive: true });

        // Filter out directories if you only want file names
        return files.map((filePath) => getFilename(filePath));
    } catch (err) {
        console.error("Error reading directory:", err);
        return [];
    }
}

const compareFiles = async (directoryPath: string, expectedFiles: string[]) => {
    // 1. Get files actually present in the folder
    // Note: readdirSync returns just the names, not the full paths
    const filesOnDisk = await getFiles(directoryPath);
    // 2. Convert to Sets for O(1) lookup performance
    const diskSet = new Set(filesOnDisk);
    const expectedSet = new Set(expectedFiles);
    console.log(diskSet);
    // console.log(expectedSet);

    // 3. Find files that are in your list but NOT on the disk
    const missingFromDisk = expectedFiles.filter((file) => !diskSet.has(file));

    // 4. Find files that are on the disk but NOT in your list (extra files)
    const extraOnDisk = filesOnDisk.filter((file) => !expectedSet.has(file));

    return {
        missingFromDisk,
        extraOnDisk,
    };
};

// --- Usage ---
const targetDir = path.join(projectRoot(), "complete-raw-static-files");

const imageUrls = (await Bun.file(
    path.join(projectRoot(), "json-files", "image-urls.json")
).json()) as Record<string, string[]>;

const myExpectedList = Object.values(imageUrls)
    .reduce((a, c) => [...a, ...c], [])

    .map((url) => getFilename(url, ".jpg"));

const result = await compareFiles(targetDir, myExpectedList);

writeJsonToFile(
    path.join(projectRoot(), "json-files", "missingFromDisk.json"),
    result.missingFromDisk
);
writeJsonToFile(
    path.join(projectRoot(), "json-files", "extraOnDisk.json"),
    result.extraOnDisk
);
