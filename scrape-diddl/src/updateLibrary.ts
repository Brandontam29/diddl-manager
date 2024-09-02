import fs from "fs";
import writeJsonToFile from "./utils/writeJsonToFile";
import { libraryPath } from "./pathing";

const library = JSON.parse(fs.readFileSync(libraryPath(), "utf8")) as {
    id: string;
    name: string;
    type: string;
    imagePath: string;
    imageWidth: number;
    imageHeight: number;
}[];

const newLibrary = library.map((item) => {
    return {
        ...item,
        name: item.name.includes("%20") ? item.name.split("%20").join("_") : item.name,
        imagePath: item.imagePath.includes("%20")
            ? item.imagePath.split("%20").join("_")
            : item.imagePath,
    };
});

writeJsonToFile(libraryPath(), newLibrary);
