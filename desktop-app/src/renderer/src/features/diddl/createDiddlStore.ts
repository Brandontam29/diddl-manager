import type { Diddl } from "@shared";
import { createStore } from "solid-js/store";

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
