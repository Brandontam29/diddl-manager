import type { LibraryEntry } from "@shared";

type Store = {
  libraryState: LibraryEntry[];
  selectedIndices: number[];
  libraryIndexMap: Record<string, number>;
};

import { createStore } from "solid-js/store";

// Initialize store
const [libraryStore, setLibraryStore] = createStore<Store>({
  libraryState: [],
  selectedIndices: [],
  libraryIndexMap: {},
});

// Export the store for direct access if needed
export { libraryStore, setLibraryStore };
