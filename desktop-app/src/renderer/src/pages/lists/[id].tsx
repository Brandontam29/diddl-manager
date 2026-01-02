import { useParams, useSearchParams } from "@solidjs/router";
import { Show, createEffect, createMemo } from "solid-js";

import { diddlStore } from "@renderer/features/diddl";
import DiddlListCard from "@renderer/features/diddl/components/DiddlListCard";
import { fetchListItems, useListItems, useLists } from "@renderer/features/lists";
import Taskbar from "@renderer/features/taskbars/Taskbar";
import useScreenWidth from "@renderer/hooks/useScreenWidth";
import { cn } from "@renderer/libs/cn";

const ListIdPage = () => {
  const params = useParams();
  const id = createMemo(() => (params.id === undefined ? null : parseInt(params.id)));

  const screenWidth = useScreenWidth();
  const listItems = useListItems(id());
  const lists = useLists();

  const [searchParams] = useSearchParams();
  const isSelectMode = createMemo(() => diddlStore.selectedIndices.length > 0);

  const diddls = createMemo(() => {
    if (!listItems()) return null;

    const entries = listItems()?.map((item) => {
      return { ...diddlStore.diddlState[item.diddlId - 1], listItem: item };
    });

    return entries;
  });

  const filteredDiddls = createMemo(() => {
    let diddlListItems = diddls();

    if (!diddlListItems) return;

    const filteredDiddls = diddlListItems.filter((item) => {
      const { type, isDamaged, isIncomplete, minCount, maxCount } = searchParams;
      const { listItem } = item;

      // If a param exists, the item must match it.
      // If the param is undefined, the condition evaluates to true.
      if (type !== undefined && item.type !== type) return false;

      if (isDamaged !== undefined && listItem.isDamaged.toString() !== isDamaged) return false;

      if (isIncomplete !== undefined && listItem.isIncomplete.toString() !== isIncomplete)
        return false;

      if (minCount !== undefined && listItem.quantity < parseInt(minCount as string)) return false;

      if (maxCount !== undefined && listItem.quantity > parseInt(maxCount as string)) return false;

      return true;
    });

    return filteredDiddls;
  });

  const list = createMemo(() => {
    return lists()?.find((list) => list.id === id());
  });

  const totalQuantity = createMemo(() => {
    return diddls()?.reduce((acc, item) => acc + item.listItem.quantity, 0);
  });

  createEffect(() => {
    const listId = id();
    if (listId === null) return;

    fetchListItems(listId);
  });

  return (
    <>
      <div class={cn("flex flex-col")} style={{ width: `${screenWidth() - 256 - 32}px` }}>
        <div class="flex items-center">
          <Show when={list()}>
            <h1 class="px-4 pt-8 text-2xl font-bold">{list()?.name}</h1>
          </Show>
          <Show when={totalQuantity()}>
            <h1 class="text-muted-foreground px-4 pt-8 text-2xl font-bold">
              {totalQuantity()} items
            </h1>
          </Show>
        </div>
        <div class={cn("relative flex grow flex-wrap gap-2 px-4 pt-8 pb-4")}>
          <DiddlListCard diddls={filteredDiddls()} isListItem={true} />
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
