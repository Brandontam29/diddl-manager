import { libraryStore } from "@renderer/features/library";

import { createEffect, createMemo, Show } from "solid-js";
import DiddlCardList from "@renderer/components/DIddlCardList";
import { fetchListItems, listStore } from "@renderer/features/lists";
import { useParams } from "@solidjs/router";

import useScreenWidth from "@renderer/hooks/useScreenWidth";
import { cn } from "@renderer/libs/cn";

import TaskbarList from "@renderer/features/taskbars/TaskbarList";

const ListIdPage = () => {
  const screenWidth = useScreenWidth();

  const params = useParams();
  const isSelectMode = createMemo(() => libraryStore.selectedIndices.length !== 0);

  const diddls = createMemo(() => {
    if (!listStore.listItems) return listStore.listItems;

    const entries = listStore.listItems.map((item) => {
      const index = libraryStore.libraryIndexMap[item.id];
      return { ...item, ...libraryStore.libraryState[index] };
    });

    return entries;
  });

  const trackerListItem = createMemo(() => {
    return listStore.trackerListItems?.find((item) => item.id === params.id);
  });

  createEffect(() => {
    fetchListItems(params.id);
  });

  return (
    <>
      <div class={cn("flex flex-col")} style={{ width: `${screenWidth() - 256 - 32}px` }}>
        <Show when={trackerListItem()}>
          <h1 class="pt-8 px-4 text-2xl font-bold">{trackerListItem()?.name}</h1>
        </Show>
        <div class={cn("relative grow px-4 pt-8 pb-4 flex flex-wrap gap-2")}>
          <DiddlCardList diddls={diddls()} isListItem={true} />
        </div>
      </div>
      <Show when={isSelectMode()}>
        <Show when={diddls()}>
          <TaskbarList diddls={diddls()!} />
        </Show>
      </Show>
    </>
  );
};

export default ListIdPage;
