import { createContext } from "svelte";
import type { ListStore } from "./listTypes";

const [internalGetListStoreContext, setInternalListStoreContext] = createContext<ListStore>();

export function getListStoreContext(): ListStore {
  const context = internalGetListStoreContext();
  if (!context) {
    throw new Error("ListStore context not found");
  }
  return context;
}

export function setListStoreContext(store: ListStore): ListStore {
  setInternalListStoreContext(store);
  return store;
}
