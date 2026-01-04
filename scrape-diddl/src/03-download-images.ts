import path from "node:path";
import { projectRoot } from "./pathing";
import { existsSync } from "./utils/exists";
import { logging } from "./logging";
import { ensureDirExists } from "./utils/ensureFileExists";

const downloadImage = async (url: string, destination: string) => {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText} ${url}`);
        }

        const bytesWritten = await Bun.write(destination, response);

        logging.info(`Downloaded ${bytesWritten} bytes to ${destination}`);
    } catch (error) {
        if (error instanceof Error) logging.error("Download failed:", error.message);
    }
};

const imageUrls = (await Bun.file(
    path.join(projectRoot(), "json-files", "image-urls.json")
).json()) as Record<string, string[]>;

const structure = (await Bun.file(
    path.join(projectRoot(), "json-files", "structure.json")
).json()) as Record<string, string[]>;

const structureKeys = Object.keys(structure);

Object.values(imageUrls).forEach((group, groupIndex) => {
    const folder = structureKeys[groupIndex];
    group.forEach(async (url) => {
        const imageName = getFilename(url, ".jpg");

        if (path.extname(imageName) === ".gif") return;

        const destination = path.join(
            projectRoot(),
            "complete-raw-static-files",
            folder,
            imageName
        );

        if (existsSync(destination)) return;
        await ensureDirExists(folder);

        downloadImage(url, destination);
    });
});

function getFilename(imageUrl: string, extname: string) {
    const urlObject = new URL(imageUrl);
    const originalFilename = path.basename(urlObject.pathname);
    if (path.extname(originalFilename).length === 0) {
        return `${originalFilename}${extname}`;
    }
    return originalFilename;
}
