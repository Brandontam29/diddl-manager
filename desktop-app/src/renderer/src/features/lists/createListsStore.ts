import { createStore } from "solid-js/store";
import type { ListItem, TrackerListItem } from "@shared";

type Store = {
  trackerListItems: TrackerListItem[] | undefined;
  listItems: ListItem[] | undefined;
};

const [listStore, setListStore] = createStore<Store>({
  trackerListItems: undefined,
  listItems: undefined,
});

export { listStore, setListStore };
