import { createStore } from "solid-js/store";

type Store = {
  selectedIndices: number[];
  indicesCount: number[];

  diffListIds: number[];
};

const [diddlStore, setDiddlStore] = createStore<Store>({
  selectedIndices: [],
  indicesCount: [],

  diffListIds: [],
});

export { diddlStore, setDiddlStore };
