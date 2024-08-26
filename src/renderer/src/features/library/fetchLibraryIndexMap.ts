import { setLibraryStore } from './createLibraryStore';

const fetchLibraryState = async () => {
  console.log('fetchLibraryState');
  const libraryJson = await window.api.getLibrary();

  if (libraryJson instanceof Error) return console.error('wtf');

  setLibraryStore('libraryState', libraryJson);
};

export default fetchLibraryState;
