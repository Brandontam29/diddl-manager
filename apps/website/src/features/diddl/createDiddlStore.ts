import { createStore } from "solid-js/store";

type Store = {
  /** Selected card ids as keys — membership is an O(1) read per card. */
  selected: Record<string, true>;
};

/** Module-level selection store (spec §6); the `/app` layout clears it on every location change. */
const [diddlStore, setDiddlStore] = createStore<Store>({ selected: {} });

export { diddlStore, setDiddlStore };
