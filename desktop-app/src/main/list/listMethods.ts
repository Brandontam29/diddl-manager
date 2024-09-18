import { readFile, writeFile } from "fs/promises";
import { type ListItem, listItemSchema } from "../../shared";
import { logging } from "../logging";
import { getList } from "./listTrackerMethods";
import { idsToIndexes } from "../library";
import { getAppFile } from "../file-system";

export const getListItems = async (listId: string) => {
  const list = await getList(listId);

  if (!list) {
    logging.error("list not found ", listId);
    return;
  }

  const rawlistEntries = await readFile(list.filePath, "utf8");

  const listEntries = JSON.parse(rawlistEntries) as ListItem[];

  return listEntries;
};

export const addListItems = async (listId: string, payload: ListItem[]) => {
  const list = await getList(listId);

  if (!list) {
    logging.error("list not found ", listId);
    return;
  }

  const listItemsNew = listItemSchema.array().parse(payload);

  const listItemsCurrent = await getListItems(listId);

  if (listItemsCurrent === undefined) {
    logging.warn("list not found ", listId);
    return;
  }

  const listItemsCombined = [...listItemsNew, ...listItemsCurrent];
  const indexesListItems = idsToIndexes(listItemsCombined.map((item) => item.id)).filter(
    (index) => index !== undefined,
  );

  if (listItemsCombined.length !== indexesListItems.length)
    return new Error("Some items added to the lsit are invalid. Action aborted.");

  const indexedArray = indexesListItems.map((n, i) => ({ listItemsIndex: i, libraryIndex: n }));

  const sortedIndexArray = indexedArray.sort((a, b) => a.libraryIndex - b.libraryIndex);

  const sortedListItemsCombined = sortedIndexArray.map((item) => {
    return listItemsCombined[item.listItemsIndex];
  });

  await writeFile(list.filePath, JSON.stringify(sortedListItemsCombined));

  return sortedListItemsCombined;
};

export const removeListItems = async (listId: string, idsToRemove: string[]) => {
  const list = await getList(listId);

  if (!list) {
    logging.error("list not found ", listId);
    return;
  }

  const listItems = getAppFile(list.filePath) as ListItem[];

  const fitleredListItems = listItems.filter((diddl) => !idsToRemove.includes(diddl.id));
  await writeFile(list.filePath, JSON.stringify(fitleredListItems));

  return fitleredListItems;
};

export const updateListItems = async (listId: string, idsToRemove: string[]) => {
  const list = await getList(listId);

  if (!list) {
    logging.error("list not found ", listId);
    return;
  }

  const listItems = getAppFile(list.filePath) as ListItem[];

  const fitleredListItems = listItems.filter((diddl) => !idsToRemove.includes(diddl.id));
  await writeFile(list.filePath, JSON.stringify(fitleredListItems));

  return fitleredListItems;
};

/**
 * export const addListItems = async (listId: string, payload: ListItem[]) => {
  const list = await getList(listId);

  if (!list) {
    logging.error("list not found ", listId);
    return;
  }

  let listItemsNew = listItemSchema.array().parse(payload);
  const listItemsCurrent = await getListItems(listId);

  if (listItemsCurrent === undefined) {
    logging.warn("list not found ", listId);
    return;
  }

  const listLibIndexesNewWithUndefined = idsToIndexes(listItemsNew.map((item) => item.id));
  const listLibIndexesCurrent = idsToIndexes(listItemsCurrent.map((item) => item.id)) as number[];

  const listLibIndexesNew = listLibIndexesNewWithUndefined.filter((x) => x !== undefined);
  listItemsNew = listItemsNew.filter((_, index) => listLibIndexesNew[index] !== undefined);

  const libIndexToItemIndexNew = Object.fromEntries(
    listItemsNew.map((_, i) => [listLibIndexesNew[i], i]),
  );
  const libIndexToItemIndexCurrent = Object.fromEntries(
    listItemsCurrent.map((_, i) => [listLibIndexesCurrent[i], i]),
  );

  const libIndexesSorted = mergeSortedAndUnsorted(listLibIndexesCurrent, listLibIndexesNew);

  const listItems = libIndexesSorted.map((libIndex) => {
    let itemIndex = libIndexToItemIndexNew[libIndex];

    if (itemIndex === undefined) {
      itemIndex = libIndexToItemIndexCurrent[libIndex];

      return listItemsCurrent[itemIndex];
    }

    return listItemsCurrent[itemIndex];
  });

  await writeFile(list.filePath, JSON.stringify(listItems));

  return listItems;
};

 */
