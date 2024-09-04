import { setLibraryStore } from "./createLibraryStore";

const fetchLibraryState = async () => {
  fetchLibrary();
  fetchLibraryIndexMap();
};

const fetchLibrary = async () => {
  const libraryJson = await window.api.getLibrary();

  if (libraryJson instanceof Error) return console.error("wtf");

  setLibraryStore("libraryState", libraryJson);
};

const fetchLibraryIndexMap = async () => {
  const libraryIndexMapJson = await window.api.getLibraryIndexMap();

  if (libraryIndexMapJson instanceof Error) return console.error("wtf");

  setLibraryStore("libraryIndexMap", libraryIndexMapJson);
};

export default fetchLibraryState;
