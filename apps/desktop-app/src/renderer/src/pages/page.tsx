import { useSearchParams } from "@solidjs/router";
import { Show, createMemo } from "solid-js";

import { diddlStore, useDiddls } from "@renderer/features/diddl";
import DiddlCardListLimiter from "@renderer/features/diddl/components/DiddlCardListLimiter";
import { diffDiddlIds, isDiffModeActive } from "@renderer/features/diddl/diffMode";
import CompareListPopover from "@renderer/features/lists/components/CompareListPopover";
import Taskbar from "@renderer/features/taskbars/Taskbar";
import useScreenWidth from "@renderer/hooks/useScreenWidth";
import { cn } from "@renderer/libs/cn";

const HomePage = () => {
  const screenWidth = useScreenWidth();
  const [searchParams] = useSearchParams<{ from: string; to: string; type: string }>();
  const diddls = useDiddls();

  const filteredDiddls = createMemo(() => {
    const allDiddls = diddls();
    if (allDiddls === null) return null;

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

    return filteredDiddls;
  });

  const isSelectMode = createMemo(() => diddlStore.selectedIndices.length > 0);

  const diffLength = createMemo(() => diffDiddlIds()?.size ?? 0);

  return (
    <>
      <div
        class={cn("relative flex grow flex-col px-4 pt-2 pb-4")}
        style={{ width: `${screenWidth() - 256 - 32}px` }}
      >
        <div class="mb-2 flex items-center gap-2">
          <CompareListPopover />
          <Show when={isDiffModeActive()}>
            <span class="text-sm text-gray-500">({diffLength()} unique items)</span>
          </Show>
        </div>
        <div class="flex grow flex-wrap content-start gap-3">
          <DiddlCardListLimiter diddls={filteredDiddls()} />
        </div>
      </div>
      <Show when={isSelectMode()}>
        <Taskbar diddls={filteredDiddls() ?? undefined} />
      </Show>
    </>
  );
};

export default HomePage;
