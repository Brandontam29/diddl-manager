import { A } from "@solidjs/router";
import { ListPlus, X } from "lucide-solid";
import { For, Show } from "solid-js";

import FallbackLoadingLists from "@renderer/components/fallback/FallbackLoadingLists";
import FallbackNoLists from "@renderer/components/fallback/FallbackNoLists";
import { Button } from "@renderer/components/ui/button";
import { useLists } from "@renderer/features/lists";
import ColorPickerPopover from "@renderer/features/lists/components/ColorPickerPopover";
import CreateListDialog from "@renderer/features/lists/components/CreateListDialog";
import DeleteListDialog from "@renderer/features/lists/components/DeleteListDialog";
import ListCard from "@renderer/features/lists/components/ListCard";

const ListsPage = () => {
  const lists = useLists();

  return (
    <div class="mx-auto w-full max-w-7xl px-4 py-8">
      <div class="mb-8 flex items-center justify-between gap-4">
        <h1 class="text-3xl font-bold">Lists</h1>

        <CreateListDialog>
          <Button variant={"outline"} class="flex items-center gap-2 rounded-md px-6">
            <ListPlus size={20} />
            <span>Create New List</span>
          </Button>
        </CreateListDialog>
      </div>
      <Show when={Array.isArray(lists())} fallback={<FallbackLoadingLists />}>
        <Show when={Array.isArray(lists()) && lists()!.length > 0} fallback={<FallbackNoLists />}>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <For each={lists()}>
              {(item) => (
                <div class="relative h-full">
                  <A href={`/lists/${item.id}`} class="h-full">
                    <ListCard list={item} />
                  </A>
                  <div class="absolute top-2 right-2">
                    <DeleteListDialog listId={item.id} listName={item.name}>
                      <X size={16} class="text-muted-foreground hover:text-destructive" />
                    </DeleteListDialog>
                  </div>
                  <div class="absolute right-0 bottom-0">
                    <ColorPickerPopover listId={item.id} currentColor={item.color} />
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default ListsPage;
