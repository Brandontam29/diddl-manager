import type { DialogTriggerProps } from "@kobalte/core/dialog";
import { type Component, type JSX } from "solid-js";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { runMutation, useListMutations } from "../mutations";

const DeleteListDialog: Component<{
  listId: number;
  listName: string;
  children: JSX.Element;
}> = (props) => {
  const { deleteList } = useListMutations();

  return (
    <Dialog>
      <DialogTrigger
        as={(triggerProps: DialogTriggerProps) => (
          <span
            {...triggerProps}
            role="button"
            aria-label={`Delete list ${props.listName}`}
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
          {/* Kobalte labels every CloseButton "Dismiss" unless told otherwise. */}
          <Dialog.CloseButton as={Button} variant="outline" aria-label="Cancel">
            Cancel
          </Dialog.CloseButton>
          <Dialog.CloseButton
            as={Button}
            variant="destructive"
            aria-label="Delete"
            onClick={() => void runMutation("Delete list", () => deleteList(props.listId))}
          >
            Delete
          </Dialog.CloseButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteListDialog;
