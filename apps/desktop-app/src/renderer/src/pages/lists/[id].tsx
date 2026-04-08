import { useParams, useSearchParams } from "@solidjs/router";
import { Show, createEffect, createMemo } from "solid-js";

import { diddlStore } from "@renderer/features/diddl";
import { fetchListItems, useListItems, useLists } from "@renderer/features/lists";
import DiddlCards from "@renderer/features/lists/components/DiddlCards";
import Taskbar from "@renderer/features/taskbars/Taskbar";
import useScreenWidth from "@renderer/hooks/useScreenWidth";
import { cn } from "@renderer/libs/cn";

const ListIdPage = () => {
  const params = useParams();
  const id = createMemo(() => (params.id === undefined ? null : parseInt(params.id)));

  const screenWidth = useScreenWidth();
  const lists = useLists();

  const [searchParams] = useSearchParams();
  const isSelectMode = createMemo(() => diddlStore.selectedIndices.length > 0);

  const filters = createMemo(() => {
    const f: {
      // type?: string;
      isDamaged?: boolean;
      isIncomplete?: boolean;
      minCount?: number;
      maxCount?: number;
    } = {};

    // if (searchParams.type !== undefined) f.type = searchParams.type;
    if (searchParams.isDamaged !== undefined) f.isDamaged = searchParams.isDamaged === "true";
    if (searchParams.isIncomplete !== undefined)
      f.isIncomplete = searchParams.isIncomplete === "true";
    if (searchParams.minCount !== undefined) f.minCount = parseInt(searchParams.minCount as string);
    if (searchParams.maxCount !== undefined) f.maxCount = parseInt(searchParams.maxCount as string);

    return Object.keys(f).length > 0 ? f : undefined;
  });

  const listItems = useListItems(id(), filters());

  const list = createMemo(() => {
    return lists()?.find((list) => list.id === id());
  });

  const totalQuantity = createMemo(() => {
    return listItems()?.reduce((acc, item) => acc + item.quantity, 0);
  });

  createEffect(() => {
    const listId = id();
    if (listId === null) return;

    fetchListItems(listId, filters());
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
          <DiddlCards items={listItems()} />
        </div>
      </div>
      <Show when={isSelectMode()}>
        <Show when={listItems()}>
          <Taskbar items={listItems()!} />
        </Show>
      </Show>
    </>
  );
};

export default ListIdPage;
