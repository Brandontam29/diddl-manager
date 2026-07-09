import { diddlStore, setDiddlStore } from "./createDiddlStore";

export const addSelectedIds = (ids: string | string[]) => {
  const idsToAdd = typeof ids === "string" ? [ids] : ids;
  const nextIds = [...diddlStore.selectedIds];

  for (const id of idsToAdd) {
    if (!nextIds.includes(id)) nextIds.push(id);
  }

  setDiddlStore("selectedIds", nextIds);
};

export const removeSelectedIds = (ids: string | string[]) => {
  const idsToRemove = typeof ids === "string" ? [ids] : ids;

  setDiddlStore(
    "selectedIds",
    diddlStore.selectedIds.filter((id) => !idsToRemove.includes(id)),
  );
};
