import { createStore } from "solid-js/store";
import type { ListItem } from "@shared";

type Store = {
    listItems: ListItem[] | undefined;
    lastSelected: string | null; // id
};

const [listStore, setListStore] = createStore<Store>({
    listItems: undefined,
    lastSelected: null,
});

const [selection, setSelection] = createStore<Record<string, number>>({});

export const addSelection = (listItemId: string, index: number) => {
    console.log("addSelection");
    setSelection((prevSelection) => ({
        ...prevSelection,
        [listItemId]: index,
    }));
};

export const removeSelection = (id: string) => {
    console.log("removeSelection");
    setSelection((prevSelection) => {
        const { [id]: value, ...rest } = prevSelection;

        // const newObj = structuredClone(prevSelection);

        // delete newObj[id];
        // return newObj;

        return rest;
    });
};

export const fetchListItems = async () => {
    const items = new Array(100).fill(null).map((_, i) => ({
        id: i.toString(),
        isDamaged: i % 2 === 0,
        isIncomplete: i % 2 === 1,
        count: i % 10,
    }));

    setListStore("listItems", items);
};

export { selection, setSelection, listStore, setListStore };
