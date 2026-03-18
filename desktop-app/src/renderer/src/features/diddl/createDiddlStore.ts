import { createStore } from "solid-js/store";

import type { Diddl } from "@shared";

type Store = {
  diddlState: Diddl[];

  selectedIndices: number[];
  indicesCount: number[];

  diffListId: number | null;
};

const [diddlStore, setDiddlStore] = createStore<Store>({
  diddlState: [],

  selectedIndices: [],
  indicesCount: [],

  diffListId: null,
});

export { diddlStore, setDiddlStore };
