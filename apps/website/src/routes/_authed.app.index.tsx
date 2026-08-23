import { createFileRoute } from "@tanstack/solid-router";
import { Show, createMemo } from "solid-js";

import { useAppData } from "@/features/app-data";
import { filterCatalog, isSelectMode, librarySearchSchema } from "@/features/diddl";
import DiddlCardListLimiter from "@/features/diddl/components/DiddlCardListLimiter";
import Taskbar from "@/features/taskbars/Taskbar";

/** The Library (CONTEXT.md): the whole Catalog, narrowed by the sidebar's URL params. */
export const Route = createFileRoute("/_authed/app/")({
  validateSearch: librarySearchSchema,
  component: Library,
});

function Library() {
  const appData = useAppData();
  const search = Route.useSearch();

  const filteredDiddls = createMemo(() => filterCatalog(appData().catalog, search()));

  return (
    <>
      <div class="relative flex grow flex-col px-4 pt-2 pb-4 max-md:pt-14">
        <div class="flex grow flex-wrap content-start gap-3">
          <DiddlCardListLimiter diddls={filteredDiddls()} />
        </div>
      </div>
      <Show when={isSelectMode()}>
        <Taskbar items={filteredDiddls()} />
      </Show>
    </>
  );
}
