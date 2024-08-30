import fs from "fs";
import path from "path";
import writeJsonToFile from "./utils/writeJsonToFile";
import { libraryPath } from "./pathing";

const library = JSON.parse(fs.readFileSync(libraryPath(), "utf8")) as Record<
    string,
    any
>[];

const newLibrary = library.map((item) => ({
    ...item,
    name: path.basename(item.name, path.extname(item.name)),
}));

writeJsonToFile(libraryPath(), newLibrary);
