import type { DialogTriggerProps } from "@kobalte/core/dialog";
import { Pencil } from "lucide-solid";
import { type Component, Show, createSignal } from "solid-js";

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
import { cn } from "@/libs/cn";
import type { AppList } from "@/features/app-data";

import { errorMessage, useListMutations } from "../mutations";

const RenameListDialog: Component<{ list: AppList; class?: string }> = (props) => {
  const { renameList } = useListMutations();
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
      await renameList(props.list.id, name());
      setOpen(false);
    } catch (e) {
      setError(errorMessage(e, "Could not rename the list."));
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
            onClick={(event: MouseEvent) => {
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
            aria-label="List name"
            class="mt-4 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          />
          <Show when={error()}>
            <p class="mt-2 text-sm text-destructive">{error()}</p>
          </Show>
          <DialogFooter class="mt-4">
            <Dialog.CloseButton as={Button} variant="outline" aria-label="Cancel">
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
