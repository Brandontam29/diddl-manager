import { AcquiredItem } from '@shared';

type Store = {
  acquiredItems: AcquiredItem[];
};

import { createStore } from 'solid-js/store';

// Initialize store
const [acquiredStore, setAcquiredStore] = createStore<Store>({
  acquiredItems: []
});

// Export the store for direct access if needed
export { acquiredStore, setAcquiredStore };
