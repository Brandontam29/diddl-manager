import { For } from "solid-js";
import { Skeleton } from "./ui/skeleton";

const FallbackLoadingLists = () => {
  const LIST4 = () => new Array(4).fill(null);
  return (
    <div class="grid grid-cols-2">
      <For each={LIST4()}>{() => <Skeleton class="h-72 aspect-[6/5]" />}</For>
    </div>
  );
};

export default FallbackLoadingLists;
