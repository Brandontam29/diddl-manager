import { useParams, useSearchParams } from "@solidjs/router";
import { Show, createEffect, createMemo } from "solid-js";

import type { ListItemFilter } from "@shared";

import { type DiddlCardItem, diddlStore, useDiddls } from "@renderer/features/diddl";
import DiddlCardListLimiter from "@renderer/features/diddl/components/DiddlCardListLimiter";
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
  const diddls = useDiddls();

  const [searchParams, setSearchParams] = useSearchParams<{
    from?: string;
    to?: string;
    type?: string;
    showAll?: string;
    isDamaged?: string;
    isIncomplete?: string;
    minCount?: string;
    maxCount?: string;
  }>();
  const isSelectMode = createMemo(() => diddlStore.selectedIds.length > 0);
  const hasListStateFilters = createMemo(
    () =>
      searchParams.isDamaged !== undefined ||
      searchParams.isIncomplete !== undefined ||
      searchParams.minCount !== undefined ||
      searchParams.maxCount !== undefined,
  );
  const isShowAllMode = createMemo(() => searchParams.showAll === "true" && !hasListStateFilters());

  const filters = createMemo(() => {
    const f: ListItemFilter = {};

    if (searchParams.type !== undefined) f.type = searchParams.type as ListItemFilter["type"];
    if (searchParams.isDamaged !== undefined) f.isDamaged = searchParams.isDamaged === "true";
    if (searchParams.isIncomplete !== undefined)
      f.isIncomplete = searchParams.isIncomplete === "true";
    if (searchParams.minCount !== undefined) f.minCount = parseInt(searchParams.minCount);
    if (searchParams.maxCount !== undefined) f.maxCount = parseInt(searchParams.maxCount);

    return Object.keys(f).length > 0 ? f : undefined;
  });

  const listItems = useListItems(id(), filters());

  const list = createMemo(() => {
    return lists()?.find((list) => list.id === id());
  });

  const distinctDiddlCount = createMemo(() => {
    const items = listItems();
    if (!items) return null;

    return new Set(items.map((item) => item.diddlId)).size;
  });

  const allModeItems = createMemo<DiddlCardItem[] | null>(() => {
    const allDiddls = diddls();
    const items = listItems();

    if (allDiddls === null || items === null) return null;

    const itemsByDiddlId = new Map<number, DiddlCardItem[]>();
    for (const item of items) {
      const diddlItems = itemsByDiddlId.get(item.diddlId) ?? [];
      diddlItems.push(item);
      itemsByDiddlId.set(item.diddlId, diddlItems);
    }

    let filteredDiddls = allDiddls;

    if (searchParams.type !== undefined) {
      filteredDiddls = filteredDiddls.filter((diddl) => searchParams.type === diddl.type);
    }

    if (searchParams.from || searchParams.to) {
      filteredDiddls = filteredDiddls.slice(
        searchParams.from === undefined ? 0 : Number.parseInt(searchParams.from),
        searchParams.to === undefined ? undefined : Number.parseInt(searchParams.to),
      );
    }

    return filteredDiddls.flatMap((diddl) => itemsByDiddlId.get(diddl.id) ?? [diddl]);
  });

  const displayedItems = createMemo<DiddlCardItem[] | null>(() => {
    if (isShowAllMode()) return allModeItems();
    return listItems();
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
          <Show when={distinctDiddlCount() !== null}>
            <h1 class="px-4 pt-8 text-2xl font-bold text-muted-foreground">
              {distinctDiddlCount()} diddls
            </h1>
          </Show>
          <button
            type="button"
            disabled={hasListStateFilters()}
            class={cn(
              "mt-8 ml-auto rounded-md border border-gray-300 px-3 py-1 text-sm",
              isShowAllMode() && "bg-gray-200",
              hasListStateFilters() && "cursor-not-allowed opacity-50",
            )}
            onClick={() => {
              setSearchParams({ showAll: isShowAllMode() ? undefined : "true" });
            }}
          >
            Show all
          </button>
        </div>
        <div class={cn("relative flex grow flex-wrap gap-2 px-4 pt-8 pb-4")}>
          <Show when={isShowAllMode()} fallback={<DiddlCards items={listItems()} />}>
            <DiddlCardListLimiter diddls={allModeItems()} highlightQuantity showQuantityControls />
          </Show>
        </div>
      </div>
      <Show when={isSelectMode()}>
        <Show when={displayedItems()}>
          <Taskbar items={displayedItems()!} />
        </Show>
      </Show>
    </>
  );
};

export default ListIdPage;
