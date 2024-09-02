import fs from "fs";
import path from "path";

// Function to recursively rename file extensions to lowercase
function renameFileExtensionsInFolder(dir: string) {
    // Read all items in the directory
    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error(`Error reading directory ${dir}:`, err);
            return;
        }

        files.forEach((file) => {
            const filePath = path.join(dir, file);

            // Check if the file path is a directory or a file
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error(`Error getting stats for file ${filePath}:`, err);
                    return;
                }

                if (stats.isDirectory()) {
                    // If it's a directory, recursively rename files in it
                    renameFileExtensionsInFolder(filePath);
                } else if (stats.isFile()) {
                    // If it's a file, check and rename its extension
                    if (file.includes("%20")) {
                        const newFileName = file.split("%20").join("_");
                        const newFilePath = path.join(dir, newFileName);

                        // Rename the file
                        fs.rename(filePath, newFilePath, (err) => {
                            if (err) {
                                console.error(
                                    `Error renaming file ${filePath} to ${newFilePath}:`,
                                    err
                                );
                            } else {
                                console.log(`Renamed: ${filePath} -> ${newFilePath}`);
                            }
                        });
                    }
                }
            });
        });
    });
}

renameFileExtensionsInFolder(
    "/home/brandon/code/diddl-manager/desktop-app/src/renderer/assets/diddl-images"
);
