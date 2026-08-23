import { Link, createFileRoute, notFound } from "@tanstack/solid-router";
import { Show, createMemo } from "solid-js";
import { z } from "zod";

import FallbackLoadingDiddl from "@/components/fallback/FallbackLoadingDiddl";
import { findList, useAppData } from "@/features/app-data";
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

const listIdParam = z.coerce.number().int().positive();

/**
 * One List's items (desktop `/lists/:id`). `params.parse` types `$listId` as a
 * positive integer for the loader, `useListId` and every `Link`; anything else is
 * `notFound()`. The loader is keyed on the id and the search params, so every
 * filter change re-fetches; `getListItems` turns a NOT_FOUND (missing or someone
 * else's list) into `notFound()` on the server and the route's `notFoundComponent`
 * renders inside the app shell.
 */
export const Route = createFileRoute("/_authed/app/lists/$listId")({
  params: {
    parse: ({ listId }) => {
      const parsed = listIdParam.safeParse(listId);
      if (!parsed.success) throw notFound();
      return { listId: parsed.data };
    },
    stringify: ({ listId }) => ({ listId: String(listId) }),
  },
  validateSearch: listSearchSchema,
  loaderDeps: ({ search }) => ({ filters: toListItemFilter(search) }),
  loader: ({ params, deps }) =>
    getListItems({ data: { listId: params.listId, filters: deps.filters } }),
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
  const params = Route.useParams();
  const items = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const showAll = createMemo(() => isShowAllMode(search()));
  const hasStateFilters = createMemo(() => hasListStateFilters(search()));
  const list = createMemo(() => findList(appData(), params().listId));
  const distinctDiddlCount = createMemo(() => new Set(items().map((item) => item.diddlId)).size);

  // The 3,900-row Catalog walk only happens in Show-all mode.
  const displayedItems = createMemo<DiddlCardItem[]>(() =>
    showAll() ? mergeCatalogWithItems(appData().catalog, items(), search()) : items(),
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
        {/* The fixed Taskbar would otherwise cover the first row's select circles. */}
        <div
          class={cn(
            "relative flex grow flex-wrap content-start gap-2 px-4 pt-8 pb-4",
            isSelectMode() && "pt-12",
          )}
        >
          <Show when={showAll()} fallback={<DiddlCards items={displayedItems()} />}>
            <DiddlCardListLimiter
              diddls={displayedItems()}
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
