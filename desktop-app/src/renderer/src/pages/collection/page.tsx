import { libraryStore, setLibraryStore } from "@renderer/features/library";

import { createEffect, createMemo, Show } from "solid-js";
import { BsBookmarkDash } from "solid-icons/bs";
import DiddlCardList from "@renderer/components/DIddlCardList";
import { fetchListItems, listStore } from "@renderer/features/lists";

import useScreenWidth from "@renderer/hooks/useScreenWidth";
import { cn } from "@renderer/libs/cn";

const CollectionPage = () => {
  const screenWidth = useScreenWidth();

  const isSelectMode = createMemo(() => libraryStore.selectedIndices.length !== 0);

  const diddls = createMemo(() => {
    if (!listStore.listItems) return listStore.listItems;

    const entries = listStore.listItems.map((item) => {
      const index = libraryStore.libraryIndexMap[item.id];
      return libraryStore.libraryState[index];
    });

    return entries;
  });

  createEffect(() => {
    fetchListItems("collection");
  });

  return (
    <>
      <div
        class={cn("relative grow px-4 pt-10 pb-4 flex flex-wrap gap-2 content-start")}
        style={{ width: `${screenWidth() - 256 - 32}px` }}
      >
        <DiddlCardList diddls={diddls()} />
      </div>
      <Show when={isSelectMode()}>
        <div class="w-full absolute top-0 inset-x flex gap-4">
          <button
            onClick={async () => {
              setLibraryStore("selectedIndices", []);
            }}
          >
            <BsBookmarkDash />
            Remove
          </button>
        </div>
      </Show>
    </>
  );
};

export default CollectionPage;
