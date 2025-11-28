import type { Diddl } from "@shared";

type Store = {
  diddlState: Diddl[];

  selectedIndices: number[];
  indicesCount: number[];
};

import { createStore } from "solid-js/store";

const [diddlStore, setDiddlStore] = createStore<Store>({
  diddlState: [],

  selectedIndices: [],
  indicesCount: [],
});

export { diddlStore, setDiddlStore };
