import type { DialogTriggerProps } from "@kobalte/core/dialog";
import { useAction } from "@solidjs/router";
import { Pencil } from "lucide-solid";
import { type Component, Show, createSignal } from "solid-js";

import type { List } from "@shared";

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
import { cn } from "@renderer/libs/cn";

import { updateListNameAction } from "../lists";
import { getErrorMessage } from "./list-sections/errors";

const RenameListDialog: Component<{ list: List; class?: string }> = (props) => {
  const updateListName = useAction(updateListNameAction);
  const [open, setOpen] = createSignal(false);
  const [name, setName] = createSignal(props.list.name);
  const [error, setError] = createSignal("");

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setName(props.list.name);
      setError("");
    }
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setError("");

    try {
      await updateListName(props.list.id, name());
      setOpen(false);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <Dialog open={open()} onOpenChange={handleOpenChange}>
      <DialogTrigger
        as={(triggerProps: DialogTriggerProps) => (
          <Button
            {...triggerProps}
            variant="ghost"
            size="icon"
            class={cn("h-8 w-8 shrink-0", props.class)}
            aria-label={`Rename list ${props.list.name}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              if (typeof triggerProps.onClick === "function") {
                (triggerProps.onClick as (event: MouseEvent) => void)(event);
              }
            }}
          >
            <Pencil size={16} />
          </Button>
        )}
      />
      <DialogContent class="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename List</DialogTitle>
            <DialogDescription>List names must be valid and unique.</DialogDescription>
          </DialogHeader>
          <input
            value={name()}
            onInput={(event) => setName(event.currentTarget.value)}
            class="mt-4 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          />
          <Show when={error()}>
            <p class="mt-2 text-sm text-destructive">{error()}</p>
          </Show>
          <DialogFooter class="mt-4">
            <Dialog.CloseButton as={Button} variant="outline">
              Cancel
            </Dialog.CloseButton>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RenameListDialog;
