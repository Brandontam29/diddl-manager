import { DialogTriggerProps } from "@kobalte/core/dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@renderer/components/ui/dialog";
import { RiMediaPlayListAddFill } from "solid-icons/ri";
import { Component, For } from "solid-js";
import { listStore } from "../createListsStore";
import { Button } from "@renderer/components/ui/button";

const ListDialog: Component<{
  open: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onListClick: (listId: string) => void;
}> = (props) => {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogTrigger
        as={(dialogProps: DialogTriggerProps) => (
          <Button
            variant={"none"}
            class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
            {...dialogProps}
          >
            <RiMediaPlayListAddFill />
            <span>Add To List</span>
          </Button>
        )}
      />
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add to List</DialogTitle>
        </DialogHeader>

        <DialogContent>
          <For each={listStore.trackerListItems}>
            {(trackerListItem) => (
              <Button variant="outline" onClick={() => props.onListClick(trackerListItem.id)}>
                {trackerListItem.name}
              </Button>
            )}
          </For>
        </DialogContent>
      </DialogContent>
    </Dialog>
  );
};

export default ListDialog;
