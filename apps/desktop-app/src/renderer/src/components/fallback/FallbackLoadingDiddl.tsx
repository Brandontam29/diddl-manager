import { For } from "solid-js";

import { uiStore } from "@renderer/features/settings/legacy-index";

import { Skeleton } from "../ui/skeleton";

const LIST = Array.from({ length: 30 });
const FallbackLoadingDiddl = () => {
  return (
    <div class="flex flex-wrap content-start gap-2">
      <For each={LIST}>
        {() => (
          <Skeleton
            class="aspect-[6/5]"
            style={{
              height: `${uiStore.cardHeight}px`,
            }}
          />
        )}
      </For>
    </div>
  );
};

export default FallbackLoadingDiddl;
