import type { LibraryEntry } from "@shared";

type Store = {
  libraryState: LibraryEntry[];
  libraryIndexMap: Record<string, number>;

  selectedIndices: number[];
  indicesCount: number[];
};

import { createStore } from "solid-js/store";

// Initialize store
const [libraryStore, setLibraryStore] = createStore<Store>({
  libraryState: [],
  libraryIndexMap: {},

  selectedIndices: [],
  indicesCount: [],
});

// Export the store for direct access if needed
export { libraryStore, setLibraryStore };
