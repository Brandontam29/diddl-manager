import { readFileSync } from "fs";
import { collectionListPath, libraryMapPath, libraryPath, listTrackerPath } from "../pathing";
import type { LibraryEntry, ListItem, TrackerListItem } from "../../shared";

function getAppFile(type: "list-tracker"): TrackerListItem[];
function getAppFile(type: "library"): LibraryEntry[];
function getAppFile(type: "library-map"): Record<string, number | undefined>;
function getAppFile(type: "collection"): ListItem[];
function getAppFile(type: string): any;
function getAppFile(type: string) {
  switch (type) {
    case "library": {
      const rawFile = readFileSync(libraryPath(), "utf8");

      const parsedContent = JSON.parse(rawFile) as LibraryEntry[];
      return parsedContent;
    }

    case "library-map": {
      const rawFile = readFileSync(libraryMapPath(), "utf8");

      const parsedContent = JSON.parse(rawFile) as Record<string, number | undefined>;

      return parsedContent;
    }

    case "collection": {
      const rawFile = readFileSync(collectionListPath(), "utf8");

      const parsedContent = JSON.parse(rawFile) as ListItem[];

      return parsedContent;
    }

    case "list-tracker": {
      const rawFile = readFileSync(listTrackerPath(), "utf8");

      const parsedContent = JSON.parse(rawFile) as TrackerListItem[];

      return parsedContent;
    }

    default: {
      const rawFile = readFileSync(type, "utf8");

      const parsedContent = JSON.parse(rawFile);

      return parsedContent;
    }
  }
}

export default getAppFile;
