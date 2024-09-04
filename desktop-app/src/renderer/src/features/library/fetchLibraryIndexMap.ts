import { setLibraryStore } from "./createLibraryStore";

const fetchLibraryState = async () => {
  const libraryJson = await window.api.getLibrary();

  if (libraryJson instanceof Error) return console.error("wtf");

  setLibraryStore("libraryState", libraryJson);
};

export default fetchLibraryState;
