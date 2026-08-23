import { createStore } from "solid-js/store";

type Store = {
  selectedIds: string[];
};

/** Module-level selection store (spec §6); the `/app` layout clears it on every location change. */
const [diddlStore, setDiddlStore] = createStore<Store>({
  selectedIds: [],
});

export { diddlStore, setDiddlStore };
