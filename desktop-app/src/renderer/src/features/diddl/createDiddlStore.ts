import { createStore } from "solid-js/store";

import type { Diddl } from "@shared";

type Store = {
  diddlState: Diddl[];

  selectedIndices: number[];
  indicesCount: number[];

  diffListIds: number[];
};

const [diddlStore, setDiddlStore] = createStore<Store>({
  diddlState: [],

  selectedIndices: [],
  indicesCount: [],

  diffListIds: [],
});

export { diddlStore, setDiddlStore };
