import { diddlStore } from "@renderer/features/diddl";

import { createEffect, createMemo, Show } from "solid-js";
import { fetchListItems, listStore } from "@renderer/features/lists";
import { useParams, useSearchParams } from "@solidjs/router";

import useScreenWidth from "@renderer/hooks/useScreenWidth";
import { cn } from "@renderer/libs/cn";

import Taskbar from "@renderer/features/taskbars/Taskbar";
import DiddlCardList from "@renderer/components/DiddlCardList";

const ListIdPage = () => {
  const screenWidth = useScreenWidth();

  const params = useParams();
  const [searchParams] = useSearchParams();
  const isSelectMode = createMemo(() => diddlStore.selectedIndices.length !== 0);

  const diddls = createMemo(() => {
    if (!listStore.listItems) return listStore.listItems;

    const entries = listStore.listItems.map((item) => {
      return { ...diddlStore.diddlState[item.diddlId - 1], listItem: item };
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
        (item) => item.listItem.isDamaged.toString() === searchParams.isDamaged,
      );
    }

    if (searchParams.isIncomplete !== undefined) {
      diddlListItems = diddlListItems.filter(
        (item) => item.listItem.isIncomplete.toString() === searchParams.isIncomplete,
      );
    }

    if (searchParams.minCount !== undefined) {
      diddlListItems = diddlListItems.filter(
        (item) => item.listItem.quantity >= parseInt(searchParams.minCount as string),
      );
    }
    if (searchParams.maxCount !== undefined) {
      diddlListItems = diddlListItems.filter(
        (item) => item.listItem.quantity <= parseInt(searchParams.maxCount as string),
      );
    }

    return diddlListItems;
  });

  const id = createMemo(() => parseInt(params.id));

  const list = createMemo(() => {
    return listStore.lists.find((list) => list.id === id());
  });

  const totalQuantity = createMemo(() => {
    return diddls().reduce((acc, item) => acc + item.listItem.quantity, 0);
  });

  createEffect(() => {
    fetchListItems(id());
  });

  return (
    <>
      <div class={cn("flex flex-col")} style={{ width: `${screenWidth() - 256 - 32}px` }}>
        <div class="flex items-center">
          <Show when={list()}>
            <h1 class="pt-8 px-4 text-2xl font-bold">{list()?.name}</h1>
          </Show>
          <Show when={totalQuantity()}>
            <h1 class="pt-8 px-4 text-2xl font-bold text-muted-foreground">
              {totalQuantity()} items
            </h1>
          </Show>
        </div>
        <div class={cn("relative grow px-4 pt-8 pb-4 flex flex-wrap gap-2")}>
          <DiddlCardList diddls={filteredDiddls()} isListItem={true} />
        </div>
      </div>
      <Show when={isSelectMode()}>
        <Show when={filteredDiddls()}>
          <Taskbar diddls={filteredDiddls()!} />
        </Show>
      </Show>
    </>
  );
};

export default ListIdPage;
