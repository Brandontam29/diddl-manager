import { createStore } from "solid-js/store";
import type { ListItem, List } from "@shared";

type Store = {
  lists: List[];
  listItems: ListItem[];
};

const [listStore, setListStore] = createStore<Store>({
  lists: [],
  listItems: [],
});

export { listStore, setListStore };
