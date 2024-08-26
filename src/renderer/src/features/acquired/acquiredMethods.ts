import { AcquiredItem } from '@shared/acquired-list-models';
import { acquiredStore, setAcquiredStore } from './createAcquiredStore';

export const addAcquiredItems = (diddlIds: string[], state?: Partial<Omit<AcquiredItem, 'id'>>) => {
  const defaultState = { isDamaged: false, isCompleteSet: true } satisfies Omit<AcquiredItem, 'id'>;

  const acquiredItems = diddlIds.map((id) => ({ id: id, ...defaultState, ...state }));

  setAcquiredStore('acquiredState', acquiredStore.acquiredState.concat(acquiredItems));
  window.api.setAcquiredList(acquiredItems);
};

export const removeAcquiredItems = (diddlIds: string[]) => {
  const setToRemove = new Set(diddlIds);

  const newAcquiredState = acquiredStore.acquiredState.filter((item) => !setToRemove.has(item.id));

  setAcquiredStore('acquiredState', newAcquiredState);
  window.api.setAcquiredList(newAcquiredState);
};

export const updateAcquiredItems = () => {};
