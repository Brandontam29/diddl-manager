import { AcquiredItem } from '@shared';

type Store = {
  acquiredState: AcquiredItem[];
};

import { createStore } from 'solid-js/store';

// Initialize store
const [acquiredStore, setAcquiredStore] = createStore<Store>({
  acquiredState: []
});

// Export the store for direct access if needed
export { acquiredStore, setAcquiredStore };
