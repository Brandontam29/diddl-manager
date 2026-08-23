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
import type { AppSection } from "@/features/app-data";

import { errorMessage, useSectionMutations } from "../../mutations";

const RenameSectionDialog: Component<{ section: AppSection }> = (props) => {
  const { renameSection } = useSectionMutations();
  const [open, setOpen] = createSignal(false);
  const [name, setName] = createSignal(props.section.name);
  const [error, setError] = createSignal("");

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setName(props.section.name);
      setError("");
    }
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setError("");

    try {
      await renameSection(props.section.id, name());
      setOpen(false);
    } catch (e) {
      setError(errorMessage(e, "Could not rename the section."));
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
            aria-label={`Rename section ${props.section.name}`}
          >
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
            aria-label="Section name"
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

export default RenameSectionDialog;
