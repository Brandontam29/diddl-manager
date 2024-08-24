import { LibraryEntry } from '@shared';

type Store = {
  libraryState: LibraryEntry[];
};

import { createStore } from 'solid-js/store';

// Initialize store
const [libraryStore, setLibraryStore] = createStore<Store>({
  libraryState: []
});

// Export the store for direct access if needed
export { libraryStore, setLibraryStore };
