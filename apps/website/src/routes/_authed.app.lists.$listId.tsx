import { Link, createFileRoute, notFound } from "@tanstack/solid-router";
import { Show, createMemo } from "solid-js";

import FallbackLoadingDiddl from "@/components/fallback/FallbackLoadingDiddl";
import { useAppData } from "@/features/app-data";
import { type DiddlCardItem, isSelectMode } from "@/features/diddl";
import DiddlCardListLimiter from "@/features/diddl/components/DiddlCardListLimiter";
import DiddlCards from "@/features/lists/components/DiddlCards";
import {
  hasListStateFilters,
  isShowAllMode,
  listSearchSchema,
  mergeCatalogWithItems,
  toListItemFilter,
} from "@/features/lists/listSearch";
import Taskbar from "@/features/taskbars/Taskbar";
import { cn } from "@/libs/cn";
import { getListItems } from "@/server/api";

/**
 * One List's items (desktop `/lists/:id`). The loader is keyed on the list id and on
 * the search params, so every filter change re-fetches; `getListItems` turns a
 * NOT_FOUND (missing or someone else's list) into `notFound()` on the server and
 * the router renders `notFoundComponent` here, inside the app shell.
 */
export const Route = createFileRoute("/_authed/app/lists/$listId")({
  validateSearch: listSearchSchema,
  loaderDeps: ({ search }) => ({ filters: toListItemFilter(search) }),
  loader: async ({ params, deps }) => {
    const listId = Number.parseInt(params.listId);
    if (Number.isNaN(listId)) throw notFound();

    const items = await getListItems({ data: { listId, filters: deps.filters } });
    return { listId, items };
  },
  pendingComponent: () => (
    <div class="relative flex grow flex-wrap gap-2 px-4 pt-8 pb-4 max-md:pt-14">
      <FallbackLoadingDiddl />
    </div>
  ),
  notFoundComponent: ListNotFound,
  component: ListPage,
});

function ListPage() {
  const appData = useAppData();
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const showAll = createMemo(() => isShowAllMode(search()));
  const hasStateFilters = createMemo(() => hasListStateFilters(search()));

  const list = createMemo(() =>
    appData()
      .sections.flatMap((section) => section.lists)
      .find((candidate) => candidate.id === data().listId),
  );

  const distinctDiddlCount = createMemo(
    () => new Set(data().items.map((item) => item.diddlId)).size,
  );

  const allModeItems = createMemo<DiddlCardItem[]>(() =>
    mergeCatalogWithItems(appData().catalog, data().items, search()),
  );

  const displayedItems = createMemo<DiddlCardItem[]>(() =>
    showAll() ? allModeItems() : data().items,
  );

  const toggleShowAll = () => {
    void navigate({
      search: (previous) => ({ ...previous, showAll: showAll() ? undefined : true }),
    });
  };

  return (
    <>
      <div class="flex grow flex-col max-md:pt-14">
        <div class="flex flex-wrap items-center">
          <Show when={list()}>
            {(list) => <h1 class="px-4 pt-8 text-2xl font-bold">{list().name}</h1>}
          </Show>
          <h1 class="px-4 pt-8 text-2xl font-bold text-muted-foreground">
            {distinctDiddlCount()} diddls
          </h1>
          <button
            type="button"
            disabled={hasStateFilters()}
            aria-pressed={showAll()}
            class={cn(
              "mt-8 mr-4 ml-auto rounded-md border border-gray-300 px-3 py-1 text-sm",
              showAll() && "bg-gray-200",
              hasStateFilters() && "cursor-not-allowed opacity-50",
            )}
            onClick={toggleShowAll}
          >
            Show all
          </button>
        </div>
        <div class="relative flex grow flex-wrap content-start gap-2 px-4 pt-8 pb-4">
          <Show when={showAll()} fallback={<DiddlCards items={data().items} />}>
            <DiddlCardListLimiter
              diddls={allModeItems()}
              highlightZeroQuantity
              showQuantityControls
            />
          </Show>
        </div>
      </div>
      <Show when={isSelectMode()}>
        <Taskbar items={displayedItems()} />
      </Show>
    </>
  );
}

function ListNotFound() {
  return (
    <div class="flex grow flex-col items-center justify-center gap-4 p-8 max-md:pt-14">
      <h1 class="text-2xl font-bold">List not found</h1>
      <p class="text-muted-foreground">This list does not exist or was deleted.</p>
      <Link to="/app/lists" class="underline">
        Back to your lists
      </Link>
    </div>
  );
}
