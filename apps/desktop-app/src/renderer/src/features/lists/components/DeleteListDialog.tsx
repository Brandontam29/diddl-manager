import type { DialogTriggerProps } from "@kobalte/core/dialog";
import { useAction } from "@solidjs/router";
import { type Component, type JSX } from "solid-js";

import { Button } from "@renderer/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@renderer/components/ui/dialog";

import { deleteListAction } from "../lists";

const DeleteListDialog: Component<{
  listId: number;
  listName: string;
  children: JSX.Element;
}> = (props) => {
  const deleteList = useAction(deleteListAction);

  return (
    <Dialog>
      <DialogTrigger
        as={(triggerProps: DialogTriggerProps) => (
          <span
            {...triggerProps}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (typeof triggerProps.onClick === "function") {
                (triggerProps.onClick as (e: MouseEvent) => void)(e);
              }
            }}
            class="cursor-pointer"
          >
            {props.children}
          </span>
        )}
      />
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete List</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>"{props.listName}"</strong>? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Dialog.CloseButton as={Button} variant="outline">
            Cancel
          </Dialog.CloseButton>
          <Dialog.CloseButton
            as={Button}
            variant="destructive"
            onClick={() => deleteList(props.listId)}
          >
            Delete
          </Dialog.CloseButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteListDialog;
