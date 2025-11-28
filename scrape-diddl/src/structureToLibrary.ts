import fs from "fs";
import path from "path";
import sizeOf from "image-size";
import writeJsonToFile from "./utils/writeJsonToFile";
import {
    diddlsPath,
    libraryItemTypeMapPath,
    projectRoot,
    structurePath,
} from "./pathing";
import fixDiddlsUnicode from "./fixLibraryUnicode";
// Synchronous method
try {
    const keys = JSON.parse(fs.readFileSync(libraryItemTypeMapPath(), "utf8"));

    const rawData = fs.readFileSync(structurePath(), "utf8");
    const jsonData = JSON.parse(rawData) as Record<string, string[]>;
    console.log(keys);

    // const idIndexMap: Record<string, number> = {};

    const diddls = Object.keys(jsonData)
        .map((directoryName) => {
            const value = jsonData[directoryName];

            return value
                .map((pictureName, i) => {
                    if (keys[directoryName] === false) {
                        console.log(pictureName + " is false");
                        return null;
                    }
                    const hasExt = path.extname(pictureName) === ".jpg";

                    // idIndexMap[id] = i;

                    let imageData: {
                        width: number | null | undefined;
                        height: number | null | undefined;
                    } = {
                        width: null,
                        height: null,
                    };
                    try {
                        const data = sizeOf(
                            path.join(
                                projectRoot(),
                                "static",
                                "diddl-images",
                                directoryName,
                                pictureName
                            )
                        );

                        imageData = data;
                    } catch (e) {
                        console.log(pictureName + " has no picture");
                    }

                    return {
                        // id: id,
                        name: path.basename(pictureName),
                        type: keys[directoryName],
                        image_path: path.join(
                            directoryName,
                            hasExt ? pictureName : `${pictureName}.jpg`
                        ),
                        image_width: imageData?.width || null,
                        image_height: imageData?.height || null,
                    };
                })
                .filter((element) => element !== null);
        })
        .flat();
    writeJsonToFile(diddlsPath(), diddls);
    fixDiddlsUnicode();
    // writeJsonToFile("library-index-map.json", idIndexMap);
} catch (error) {
    console.error("Error reading or parsing the JSON file:", error);
}
