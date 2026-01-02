import { A } from "@solidjs/router";
import { ListPlus } from "lucide-solid";
import { For, Show } from "solid-js";

import FallbackLoadingLists from "@renderer/components/fallback/FallbackLoadingLists";
import FallbackNoLists from "@renderer/components/fallback/FallbackNoLists";
import { Button } from "@renderer/components/ui/button";
import { useLists } from "@renderer/features/lists";
import CreateListDialog from "@renderer/features/lists/components/CreateListDialog";
import ListCard from "@renderer/features/lists/components/ListCard";

const ListsPage = () => {
  const lists = useLists();

  return (
    <div class="grow px-4 py-8">
      <div class="mb-4 flex items-center gap-4">
        <h1 class="text-xl font-bold">Lists</h1>

        <CreateListDialog>
          <Button as="div" variant={"outline"} class="flex grow items-center gap-2 rounded-md">
            <ListPlus />
            <span>Create New</span>
          </Button>
        </CreateListDialog>
      </div>
      <Show when={Array.isArray(lists())} fallback={<FallbackLoadingLists />}>
        <Show when={Array.isArray(lists()) && lists()!.length > 0} fallback={<FallbackNoLists />}>
          <div class="grid grid-flow-col justify-start gap-4">
            <For each={lists()}>
              {(item) => (
                <A href={`/lists/${item.id}`}>
                  <ListCard list={item} />
                </A>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default ListsPage;
