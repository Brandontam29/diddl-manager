import { AcquiredItem } from '@shared/acquired-list-models';
import { acquiredStore, setAcquiredStore } from './createAcquiredStore';

export const addAcquiredItems = async (
  diddlIds: string[],
  state?: Partial<Omit<AcquiredItem, 'id'>>
) => {
  const defaultState = { isDamaged: false, isCompleteSet: true } satisfies Omit<AcquiredItem, 'id'>;

  const acquiredItems = diddlIds.map((id) => ({ id: id, ...defaultState, ...state }));

  setAcquiredStore('acquiredItems', acquiredStore.acquiredItems.concat(acquiredItems));
  window.api.setAcquiredList(acquiredItems);
};

export const removeAcquiredItems = async (diddlIds: string[]) => {
  const setToRemove = new Set(diddlIds);

  const newAcquiredState = acquiredStore.acquiredItems.filter((item) => !setToRemove.has(item.id));

  setAcquiredStore('acquiredItems', newAcquiredState);
  window.api.setAcquiredList(newAcquiredState);
};

export const updateAcquiredItems = () => {};
