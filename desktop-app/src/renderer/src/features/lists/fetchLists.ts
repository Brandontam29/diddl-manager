import { setListStore } from "./createListsStore";

const fetchLists = async () => {
  try {
    const lists = await window.api.getLists();
    setListStore("lists", lists);
  } catch (err) {
    console.error(err);
  }
};

export default fetchLists;
