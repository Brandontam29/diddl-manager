import { createStore } from "solid-js/store";

type Store = {
  selectedIds: string[];
};

const [diddlStore, setDiddlStore] = createStore<Store>({
  selectedIds: [],
});

export { diddlStore, setDiddlStore };
