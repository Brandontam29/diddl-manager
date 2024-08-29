import fs from 'fs/promises';
import path from 'path';

import isExists from './isExists';

async function copyFolder(source: string, destination: string) {
    // Create the destination folder if it doesn't exist
    if (await isExists(destination)) {
        await fs.mkdir(destination, { recursive: true });
    }

    // Read the contents of the source folder
    const files = await fs.readdir(source);

    files.forEach(async (file) => {
        const srcPath = path.join(source, file);
        const destPath = path.join(destination, file);

        // Check if it's a file or directory
        if ((await fs.lstat(srcPath)).isDirectory()) {
            // Recursively copy subdirectories
            copyFolder(srcPath, destPath);
        } else {
            // Copy files
            fs.copyFile(srcPath, destPath);
        }
    });
}

export default copyFolder;
