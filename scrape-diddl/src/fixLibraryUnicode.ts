import fs from "fs";
import writeJsonToFile from "./utils/writeJsonToFile";
import { diddlsPath } from "./pathing";

const decodeUrlString = (encodedString: string): string => {
    try {
        // decodeURIComponent is generally preferred over decodeURI
        // because it handles special characters like '&', '=', and '?'
        // inside query parameters correctly.
        return decodeURIComponent(encodedString);
    } catch (error) {
        console.error("Failed to decode URL string:", error);
        // Fallback: return the original string so the app doesn't crash
        return encodedString;
    }
};

const fixDiddlsUnicode = () => {
    const library = JSON.parse(fs.readFileSync(diddlsPath(), "utf8")) as {
        name: string;
        image_path: string;
    }[];

    const newLibrary = library.map((item) => {
        return {
            ...item,
            name: decodeUrlString(item.name),
            image_path: decodeUrlString(item.image_path),
        };
    });

    writeJsonToFile(diddlsPath(), newLibrary);
};

export default fixDiddlsUnicode;
