import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import sizeOf from "image-size";
import writeJsonToFile from "./utils/writeJsonToFile";
// Synchronous method
try {
    const keys = JSON.parse(fs.readFileSync("keys-map.json", "utf8"));

    const rawData = fs.readFileSync("structure.json", "utf8");
    const jsonData = JSON.parse(rawData) as Record<string, string[]>;
    console.log(keys);

    const idIndexMap: Record<string, number> = {};

    const pictureData = Object.keys(jsonData)
        .map((directoryName) => {
            const value = jsonData[directoryName];

            return value
                .map((pictureName, i) => {
                    if (keys[directoryName] === false) {
                        console.log(pictureName + " is false");
                        return null;
                    }
                    const hasExt = path.extname(pictureName) === ".jpg";

                    const id = nanoid();

                    idIndexMap[id] = i;

                    let imageData: {
                        width: number | null | undefined;
                        height: number | null | undefined;
                    } = {
                        width: null,
                        height: null,
                    };
                    try {
                        const data = sizeOf(
                            path.join("diddl-images", directoryName, pictureName)
                        );

                        imageData = data;
                    } catch (e) {
                        console.log(pictureName + " has no picture");
                    }

                    return {
                        id: id,
                        name: path.basename(pictureName),
                        type: keys[directoryName],
                        imagePath: path.join(
                            directoryName,
                            hasExt ? pictureName : `${pictureName}.jpg`
                        ),
                        imageWidth: imageData?.width || null,
                        imageHeight: imageData?.height || null,
                    };
                })
                .filter((element) => element !== null);
        })
        .flat();
    writeJsonToFile("library.json", pictureData);
    writeJsonToFile("library-index-map.json", idIndexMap);
} catch (error) {
    console.error("Error reading or parsing the JSON file:", error);
}
