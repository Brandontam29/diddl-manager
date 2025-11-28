import { RiMediaPlayListAddFill } from "solid-icons/ri";
import { Component, For, Show } from "solid-js";
import { listStore } from "../createListsStore";
import { Button } from "@renderer/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@renderer/components/ui/popover";
import CreateListDialog from "@renderer/features/lists/components/CreateListDialog";

const AddToListPopover: Component<{
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onListClick: (listId: number) => void;
}> = (props) => {
  return (
    <Popover>
      <PopoverTrigger class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200">
        <RiMediaPlayListAddFill />
        <span>Add To List</span>
      </PopoverTrigger>

      <PopoverContent class="min-w-96">
        <CreateListDialog callback={(list) => props.onListClick(list.id)}>
          <Button as="div" variant="pink">
            Create New List
          </Button>
        </CreateListDialog>
        <Show when={listStore.lists}>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <For each={listStore.lists}>
              {(list) => (
                <Button variant="outline" onClick={() => props.onListClick(list.id)} class="block">
                  {list.name}
                </Button>
              )}
            </For>
          </div>
        </Show>
      </PopoverContent>
    </Popover>
  );
};

export default AddToListPopover;
