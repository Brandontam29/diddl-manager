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

import { runMutation } from "../mutations";

/**
 * One confirmation dialog for deleting a List or a List Section. `children` is
 * the trigger's content (an icon); `confirmLabel` names both the destructive
 * button and the mutation in the failure toast.
 */
const ConfirmDeleteDialog: Component<{
  title: string;
  description: JSX.Element;
  /** Accessible name of the trigger, e.g. "Delete list Keepers". */
  label: string;
  confirmLabel: string;
  onConfirm: () => Promise<unknown>;
  class?: string;
  children: JSX.Element;
}> = (props) => {
  return (
    <Dialog>
      <DialogTrigger
        as={Button}
        variant="ghost"
        size="icon"
        class={props.class}
        aria-label={props.label}
      >
        {props.children}
      </DialogTrigger>
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>{props.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {/* Kobalte labels every CloseButton "Dismiss" unless told otherwise. */}
          <Dialog.CloseButton as={Button} variant="outline" aria-label="Cancel">
            Cancel
          </Dialog.CloseButton>
          <Dialog.CloseButton
            as={Button}
            variant="destructive"
            aria-label={props.confirmLabel}
            onClick={() => void runMutation(props.confirmLabel, props.onConfirm)}
          >
            {props.confirmLabel}
          </Dialog.CloseButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
