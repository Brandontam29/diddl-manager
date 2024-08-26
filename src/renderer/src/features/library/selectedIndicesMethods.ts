import { libraryStore, setLibraryStore } from './createLibraryStore';

export const addSelectedIndices = (indices: number | number[]) => {
  setLibraryStore('selectedIndices', [
    ...libraryStore.selectedIndices,
    ...(typeof indices === 'number' ? [indices] : indices)
  ]);
};

export const removeSelectedIndices = (indices: number | number[]) => {
  if (typeof indices === 'number')
    return setLibraryStore(
      'selectedIndices',
      libraryStore.selectedIndices.filter((num) => indices !== num)
    );

  setLibraryStore(
    'selectedIndices',
    libraryStore.selectedIndices.filter((num) => !indices.includes(num))
  );
};
