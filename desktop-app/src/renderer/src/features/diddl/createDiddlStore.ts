import { createStore } from "solid-js/store";

import type { Diddl } from "@shared";

type Store = {
  diddlState: Diddl[];

  selectedIndices: number[];
  indicesCount: number[];
};

const [diddlStore, setDiddlStore] = createStore<Store>({
  diddlState: [],

  selectedIndices: [],
  indicesCount: [],
});

export { diddlStore, setDiddlStore };
