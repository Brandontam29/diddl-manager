import type { ListItem } from '@shared';
import { listStore, setListStore } from './createListsStore';

export const fetchListItems = async (listId: string) => {
  const listItems = await window.api.getListItems(listId);

  setListStore('listItems', listItems);
};

export const setListItems = (listId: string, listItems: ListItem[]) => {
  setListStore('listItems', listItems);

  window.api.setList(listId, listItems);
};

export const addListItems = async (
  listId: string,
  diddlIds: string[],
  state?: Partial<Omit<ListItem, 'id'>>
) => {
  const defaultState = { isDamaged: false, isCompleteSet: true, count: 1 } satisfies Omit<
    ListItem,
    'id'
  >;

  const listItemsToAdd = diddlIds.map((id) => ({ id: id, ...defaultState, ...state }));

  const completeListItems = await window.api.addListItems(listId, listItemsToAdd);

  if (completeListItems === undefined) {
    return; //toast
  }

  setListStore('listItems', completeListItems);
};

export const removeListItems = async (listId: string, idsToRemove: string[]) => {
  if (listStore.listItems === undefined) return; //toast

  const listItems = listStore.listItems.filter((diddl) => !idsToRemove.includes(diddl.id));

  setListStore('listItems', listItems);
  window.api.setList(listId, listItems);
};

// export const updateListItems = async (
//   listId: string,
//   diddlIds: string[],
//   action: {
//     addCount?: number;
//     isDamaged?: boolean;
//     isCompleteSet?: boolean;
//   }
// ) => {
//   const listIems =  await window.api.getList(listId);
//   const listItems = diddls.filter((diddl) => !idsToRemove.includes(diddl.id));

//   window.api.setList(listId, listItems);
// };
