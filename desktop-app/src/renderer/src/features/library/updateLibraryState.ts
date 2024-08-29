import { setLibraryStore, libraryStore } from './createLibraryStore';

type UpdateLibraryEntry = {
  owned?: boolean;
  damaged?: boolean;
  type?: string;
  isCompleteSet?: boolean;
};

const updateLibraryState = async (indices: number[], options: UpdateLibraryEntry) => {
  setLibraryStore('libraryState', indices, (diddl) => ({ ...diddl, ...options }));

  await window.api.setLibrary(libraryStore.libraryState);
};

export default updateLibraryState;

/**
 * const updateLibraryState = async (indices: number[], options: UpdateLibraryEntry) => {
  const libraryState = await window.api.getLibrary();

  if (libraryState instanceof Error) return;

  for (let i = 0; i < indices.length; i++) {
    const index = indices[i];

    libraryState[index] = {
      ...libraryState[index],
      ...options
    };
  }

  await window.api.setLibrary(libraryState);

  setLibraryState(libraryState);
};
 */
