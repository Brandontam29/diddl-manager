import { libraryStore } from './createLibraryStore';

const getIndexFromLibraryItemIds = (ids: string[]) => {
  return ids.map((id) => libraryStore.libraryIndexMap[id] || null);
};

export default getIndexFromLibraryItemIds;
