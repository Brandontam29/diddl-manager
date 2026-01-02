import { For } from "solid-js";

import { Skeleton } from "../ui/skeleton";

const LIST_4 = Array.from({ length: 4 }).fill(null);

const FallbackLoadingLists = () => {
  return (
    <div class="grid grid-cols-2">
      <For each={LIST_4}>{() => <Skeleton class="aspect-6/5 h-72" />}</For>
    </div>
  );
};

export default FallbackLoadingLists;
