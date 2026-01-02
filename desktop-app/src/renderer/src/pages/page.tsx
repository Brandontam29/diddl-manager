import { useSearchParams } from "@solidjs/router";
import { Show, createMemo } from "solid-js";

import { diddlStore } from "@renderer/features/diddl";
import DiddlCardListLimiter from "@renderer/features/diddl/components/DiddlCardListLimiter";
import Taskbar from "@renderer/features/taskbars/Taskbar";
import useScreenWidth from "@renderer/hooks/useScreenWidth";
import { cn } from "@renderer/libs/cn";

const HomePage = () => {
  const screenWidth = useScreenWidth();
  const [searchParams] = useSearchParams<{ from: string; to: string; type: string }>();

  const filteredDiddls = createMemo(() => {
    let diddls = diddlStore.diddlState;

    if (searchParams.type !== undefined) {
      diddls = diddls.filter((diddl) => searchParams.type === diddl.type);
    }

    if (searchParams.from || searchParams.to) {
      diddls = diddls.slice(
        searchParams.from === undefined ? 0 : Number.parseInt(searchParams.from),
        searchParams.to === undefined ? undefined : Number.parseInt(searchParams.to),
      );
    }

    return diddls;
  });

  const isSelectMode = createMemo(() => diddlStore.selectedIndices.length > 0);

  return (
    <>
      <div
        class={cn("relative flex grow flex-wrap content-start gap-2 px-4 pt-10 pb-4")}
        style={{ width: `${screenWidth() - 256 - 32}px` }}
      >
        <DiddlCardListLimiter diddls={filteredDiddls()} />
      </div>
      <Show when={isSelectMode()}>
        <Taskbar diddls={filteredDiddls()} />
      </Show>
    </>
  );
};

export default HomePage;
