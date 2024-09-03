import { readFile, writeFile } from 'fs/promises';
import { ListItem, listItemSchema } from '../../shared';
import { logging } from '../logging';
import { getList } from './listTrackerMethods';
import { idsToIndexes } from '../library';
import { getAppFile } from '../file-system';

export const getListItems = async (listId: string) => {
  const list = await getList(listId);

  if (!list) {
    logging.error('list not found ', listId);
    return;
  }

  const rawlistEntries = await readFile(list.filePath, 'utf8');

  const listEntries = JSON.parse(rawlistEntries) as ListItem[];

  return listEntries;
};

export const addListItems = async (listId: string, payload: ListItem[]) => {
  const list = await getList(listId);

  if (!list) {
    logging.error('list not found ', listId);
    return;
  }

  let listItemsNew = listItemSchema.array().parse(payload);
  const listItemsCurrent = await getListItems(listId);

  if (listItemsCurrent === undefined) {
    logging.warn('list not found ', listId);
    return;
  }

  let listLibIndexesNewWithUndefined = idsToIndexes(listItemsNew.map((item) => item.id));
  const listLibIndexesCurrent = idsToIndexes(listItemsCurrent.map((item) => item.id)) as number[];

  listItemsNew = listItemsNew.filter((_, index) => listLibIndexesNew[index] !== undefined);
  const listLibIndexesNew = listLibIndexesNewWithUndefined.filter((x) => x !== undefined);

  const libIndexToItemIndexNew = Object.fromEntries(
    listItemsNew.map((_, i) => [listLibIndexesNew[i], i])
  );
  const libIndexToItemIndexCurrent = Object.fromEntries(
    listItemsCurrent.map((_, i) => [listLibIndexesCurrent[i], i])
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

export const removeListItems = async (listId: string, idsToRemove: string[]) => {
  const list = await getList(listId);

  if (!list) {
    logging.error('list not found ', listId);
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
