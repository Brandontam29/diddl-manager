import { createStore } from "solid-js/store";

type Store = {
  selectedIndices: number[];
  indicesCount: number[];
};

const [diddlStore, setDiddlStore] = createStore<Store>({
  selectedIndices: [],
  indicesCount: [],
});

export { diddlStore, setDiddlStore };
