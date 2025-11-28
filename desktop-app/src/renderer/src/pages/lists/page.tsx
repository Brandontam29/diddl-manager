import FallbackLoadingLists from "@renderer/components/FallbackLoadingLists";
import FallbackNoLists from "@renderer/components/FallbackNoLists";
import { listStore } from "@renderer/features/lists";
import { A } from "@solidjs/router";
import { createEffect, For, Show } from "solid-js";
import ListCard from "@renderer/features/lists/components/ListCard";
import CreateListDialog from "@renderer/features/lists/components/CreateListDialog";
import { ListPlus } from "lucide-solid";
import { Button } from "@renderer/components/ui/button";

const ListsPage = () => {
  const lists = () => listStore.lists;

  createEffect(() => console.log(lists()));
  return (
    <div class="grow px-4 py-8">
      <div class="flex items-center mb-4 gap-4">
        <h1 class="text-xl font-bold">Lists</h1>

        <CreateListDialog>
          <Button as="div" variant={"outline"} class="grow flex items-center gap-2 rounded-md">
            <ListPlus />
            <span>Create New</span>
          </Button>
        </CreateListDialog>
      </div>
      <Show when={Array.isArray(lists())} fallback={<FallbackLoadingLists />}>
        <Show when={Array.isArray(lists()) && lists()!.length > 0} fallback={<FallbackNoLists />}>
          <div class="grid grid-flow-col gap-4 justify-start">
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
