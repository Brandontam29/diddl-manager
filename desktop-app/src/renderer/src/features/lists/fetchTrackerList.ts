import { setListStore } from "./createListsStore";

const fetchTrackerList = async () => {
  try {
    const lists = await window.api.getLists();
    setListStore(
      "trackerListItems",
      lists.filter((item) => item.id !== "collection"),
    );
  } catch (err) {
    console.error(err);
  }
};

export default fetchTrackerList;
