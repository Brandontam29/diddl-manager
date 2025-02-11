import { libraryStore } from "@renderer/features/library";

import { createEffect, createMemo, Show } from "solid-js";
import DiddlCardList from "@renderer/components/DiddlCardList";
import { fetchListItems, listStore } from "@renderer/features/lists";
import { useParams, useSearchParams } from "@solidjs/router";

import useScreenWidth from "@renderer/hooks/useScreenWidth";
import { cn } from "@renderer/libs/cn";

import TaskbarList from "@renderer/features/taskbars/TaskbarList";

const ListIdPage = () => {
  const screenWidth = useScreenWidth();

  const params = useParams();
  const [searchParams] = useSearchParams();
  const isSelectMode = createMemo(() => libraryStore.selectedIndices.length !== 0);

  const diddls = createMemo(() => {
    if (!listStore.listItems) return listStore.listItems;

    const entries = listStore.listItems.map((item) => {
      const index = libraryStore.libraryIndexMap[item.id];
      return { ...item, ...libraryStore.libraryState[index] };
    });

    return entries;
  });

  const filteredDiddls = createMemo(() => {
    let diddlListItems = diddls();

    if (!diddlListItems) return;

    if (searchParams.type !== undefined) {
      diddlListItems = diddlListItems.filter((diddl) => searchParams.type === diddl.type);
    }

    if (searchParams.isDamaged !== undefined) {
      diddlListItems = diddlListItems.filter(
        (item) => item.isDamaged.toString() === searchParams.isDamaged,
      );
    }

    if (searchParams.isIncomplete !== undefined) {
      diddlListItems = diddlListItems.filter(
        (item) => item.isIncomplete.toString() === searchParams.isIncomplete,
      );
    }

    if (searchParams.minCount !== undefined) {
      diddlListItems = diddlListItems.filter(
        (item) => item.count.toString() >= searchParams.minCount!,
      );
    }
    if (searchParams.maxCount !== undefined) {
      diddlListItems = diddlListItems.filter(
        (item) => item.count.toString() <= searchParams.maxCount!,
      );
    }

    return diddlListItems;
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
        <div class="flex items-center">
          <Show when={trackerListItem()}>
            <h1 class="pt-8 px-4 text-2xl font-bold">{trackerListItem()?.name}</h1>
          </Show>
        </div>
        <div class={cn("relative grow px-4 pt-8 pb-4 flex flex-wrap gap-2")}>
          <DiddlCardList diddls={filteredDiddls()} isListItem={true} />
        </div>
      </div>
      <Show when={isSelectMode()}>
        <Show when={filteredDiddls()}>
          <TaskbarList diddls={filteredDiddls()!} />
        </Show>
      </Show>
    </>
  );
};

export default ListIdPage;
