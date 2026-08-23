import { RiMediaPlayListAddFill } from "solid-icons/ri";
import { Component, For, Show, createMemo } from "solid-js";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CreateListDialog from "@/features/lists/components/CreateListDialog";
import { useAppData } from "@/features/app-data";

/**
 * `onListClick` receives the element that was clicked so the caller can burst
 * confetti from it; it is `undefined` when the list was just created in the dialog.
 */
const AddToListPopover: Component<{
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onListClick: (listId: number, origin?: Element) => void;
}> = (props) => {
  const appData = useAppData();
  const lists = createMemo(() => appData().sections.flatMap((section) => section.lists));

  return (
    <Popover open={props.open} onOpenChange={props.onOpenChange}>
      <PopoverTrigger class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200">
        <RiMediaPlayListAddFill />
        <span>Add To List</span>
      </PopoverTrigger>

      <PopoverContent class="min-w-96">
        <CreateListDialog callback={(list) => props.onListClick(list.id)}>
          <Button as="div" variant="pink">
            Create New List
          </Button>
        </CreateListDialog>
        <Show when={lists().length > 0}>
          <div class="mt-2 grid grid-cols-2 gap-2">
            <For each={lists()}>
              {(list) => (
                <Button
                  variant="outline"
                  onClick={(e: MouseEvent) =>
                    props.onListClick(list.id, e.currentTarget as Element)
                  }
                  class="block"
                >
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
