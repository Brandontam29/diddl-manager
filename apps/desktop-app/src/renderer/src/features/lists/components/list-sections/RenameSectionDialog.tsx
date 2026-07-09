import type { DialogTriggerProps } from "@kobalte/core/dialog";
import { useAction } from "@solidjs/router";
import { Pencil } from "lucide-solid";
import { type Component, Show, createSignal } from "solid-js";

import type { ListSectionWithLists } from "@shared";

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
import { renameListSectionAction } from "@renderer/features/lists";

import { getErrorMessage } from "./errors";

const RenameSectionDialog: Component<{ section: ListSectionWithLists }> = (props) => {
  const renameSection = useAction(renameListSectionAction);
  const [open, setOpen] = createSignal(false);
  const [name, setName] = createSignal(props.section.name);
  const [error, setError] = createSignal("");

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setError("");

    try {
      await renameSection(props.section.id, name());
      setOpen(false);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <Dialog open={open()} onOpenChange={setOpen}>
      <DialogTrigger
        as={(triggerProps: DialogTriggerProps) => (
          <Button {...triggerProps} variant="ghost" size="icon" aria-label="Rename section">
            <Pencil size={16} />
          </Button>
        )}
      />
      <DialogContent class="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename Section</DialogTitle>
            <DialogDescription>Section names must be unique.</DialogDescription>
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

export default RenameSectionDialog;
