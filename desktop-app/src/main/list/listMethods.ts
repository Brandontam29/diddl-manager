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
  console.log("listItemsNew", listItemsNew);

  const listItemsCurrent = await getListItems(listId);
  console.log("listItemsCurrent", listItemsCurrent);

  if (listItemsCurrent === undefined) {
    logging.warn("list not found ", listId);
    return;
  }

  const listItemsCombined = [...listItemsNew, ...listItemsCurrent];
  console.log("listItemsCombined", listItemsCombined);
  const indexesListItems = idsToIndexes(listItemsCombined.map((item) => item.id)).filter(
    (index) => index !== undefined,
  );

  if (listItemsCombined.length !== indexesListItems.length)
    return new Error("Some items added to the lsit are invalid. Action aborted.");

  const indexedArray = indexesListItems.map((n, i) => ({ listItemsIndex: i, libraryIndex: n }));
  console.log("indexedArray", indexedArray);

  const sortedIndexArray = indexedArray.sort((a, b) => a.libraryIndex - b.libraryIndex);
  console.log("sortedIndexArray", sortedIndexArray);

  const sortedListItemsCombined = sortedIndexArray.map((item) => {
    console.log("listItemsCombined[item.listItemsIndex]", listItemsCombined[item.listItemsIndex]);
    console.log("listItemsCombined", listItemsCombined);
    console.log("item.listItemsIndex", item.listItemsIndex);
    return listItemsCombined[item.listItemsIndex];
  });

  console.log("sortedListItemsCombined", sortedListItemsCombined);

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

function mergeSortedAndUnsorted(sortedArr: number[], unsortedArr: number[]): number[] {
  // Sort the unsorted array
  const sortedUnsortedArr = unsortedArr.sort((a, b) => a - b);

  // Merge the two sorted arrays
  const result: number[] = [];
  let i = 0,
    j = 0;

  while (i < sortedArr.length && j < sortedUnsortedArr.length) {
    if (sortedArr[i] <= sortedUnsortedArr[j]) {
      result.push(sortedArr[i]);
      i++;
    } else {
      result.push(sortedUnsortedArr[j]);
      j++;
    }
  }

  // Add remaining elements from sortedArr, if any
  while (i < sortedArr.length) {
    result.push(sortedArr[i]);
    i++;
  }

  // Add remaining elements from sortedUnsortedArr, if any
  while (j < sortedUnsortedArr.length) {
    result.push(sortedUnsortedArr[j]);
    j++;
  }

  return result;
}

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
