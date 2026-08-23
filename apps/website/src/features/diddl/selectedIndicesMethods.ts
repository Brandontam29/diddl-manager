import { reconcile } from "solid-js/store";

import { type DiddlCardItem, getCardItemId } from "./cardItems";
import { diddlStore, setDiddlStore } from "./createDiddlStore";

const toList = (ids: string | string[]) => (typeof ids === "string" ? [ids] : ids);

export const addSelectedIds = (ids: string | string[]) => {
  setDiddlStore("selected", Object.fromEntries(toList(ids).map((id) => [id, true as const])));
};

export const removeSelectedIds = (ids: string | string[]) => {
  setDiddlStore("selected", Object.fromEntries(toList(ids).map((id) => [id, undefined])));
};

export const clearSelectedIds = () => setDiddlStore("selected", reconcile({}));

/** Selected ids in selection order (the last one is the shift-click anchor). */
export const selectedIds = () => Object.keys(diddlStore.selected);

export const selectedCount = () => selectedIds().length;

export const isSelectedId = (id: string) => diddlStore.selected[id] === true;

export const isSelected = (item: DiddlCardItem) => isSelectedId(getCardItemId(item));

/** Reactive: true while at least one card is selected. */
export const isSelectMode = () => selectedCount() > 0;

/** The selected subset of `items`, in `items` order. */
export const selectedItems = (items: DiddlCardItem[]) => items.filter(isSelected);
