import { diddlStore, setDiddlStore } from "./createDiddlStore";

export const addSelectedIndices = (indices: number | number[]) => {
  setDiddlStore("selectedIndices", [
    ...diddlStore.selectedIndices,
    ...(typeof indices === "number" ? [indices] : indices),
  ]);
};

export const removeSelectedIndices = (indices: number | number[]) => {
  if (typeof indices === "number")
    return setDiddlStore(
      "selectedIndices",
      diddlStore.selectedIndices.filter((num) => indices !== num),
    );

  setDiddlStore(
    "selectedIndices",
    diddlStore.selectedIndices.filter((num) => !indices.includes(num)),
  );
};
