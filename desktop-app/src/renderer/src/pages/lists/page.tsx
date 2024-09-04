import FallbackLoadingLists from "@renderer/components/FallbackLoadingLists";
import FallbackNoLists from "@renderer/components/FallbackNoLists";
import { listStore } from "@renderer/features/lists";
import { A } from "@solidjs/router";
import { For, Show } from "solid-js";

const ListsPage = () => {
  return (
    <div class="grow px-4 pt-10 pb-4">
      <Show when={Array.isArray(listStore.trackerListItems)} fallback={<FallbackLoadingLists />}>
        <Show
          when={Array.isArray(listStore.trackerListItems) && listStore.trackerListItems.length > 0}
          fallback={<FallbackNoLists />}
        >
          <div class="grid">
            <For each={listStore.trackerListItems}>
              {(item) => <A href={`/lists/${item.id}`}>{item.name}</A>}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default ListsPage;
