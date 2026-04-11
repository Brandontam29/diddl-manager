import { libraryPath, libraryMapPath, collectionPath, projectRoot } from "./pathing";
import { readJsonFile } from "./utils/read-json-file";
import writeJsonToFile from "./utils/writeJsonToFile";
import path from "node:path";

const library = (await readJsonFile(libraryPath())) as any[];
const libraryMap = (await readJsonFile(libraryMapPath())) as any[];
const collection = (await readJsonFile(collectionPath())) as any[];

const itemsWithCorrectid = collection.map((item) => {
    return {
        ...item,
        id: libraryMap[item.id],
    };
});

writeJsonToFile(
    path.join(projectRoot(), "json-files", "lists", "new-collection.json"),
    itemsWithCorrectid
);
