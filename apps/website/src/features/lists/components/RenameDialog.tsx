import { Pencil } from "lucide-solid";
import { type Component, createSignal } from "solid-js";
import type { z } from "zod";

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
import { TextField, TextFieldErrorMessage, TextFieldRoot } from "@/components/ui/textfield";
import { cn } from "@/libs/cn";

import { errorMessage } from "../mutations";

/**
 * One rename dialog for Lists and List Sections: a pencil trigger, the name field
 * validated client-side with the entity's zod schema, and `onSubmit` for the call.
 */
const RenameDialog: Component<{
  title: string;
  description: string;
  /** Accessible name of the trigger and of the field, e.g. "Rename list Keepers". */
  label: string;
  fieldLabel: string;
  initialName: string;
  schema: z.ZodType<string, string>;
  onSubmit: (name: string) => Promise<unknown>;
  class?: string;
}> = (props) => {
  const [open, setOpen] = createSignal(false);
  const [name, setName] = createSignal(props.initialName);
  const [error, setError] = createSignal("");

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setName(props.initialName);
      setError("");
    }
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setError("");

    const parsed = props.schema.safeParse(name());
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid name");
      return;
    }

    try {
      await props.onSubmit(parsed.data);
      setOpen(false);
    } catch (e) {
      setError(errorMessage(e, "Could not rename."));
    }
  };

  return (
    <Dialog open={open()} onOpenChange={handleOpenChange}>
      <DialogTrigger
        as={Button}
        variant="ghost"
        size="icon"
        class={cn("h-8 w-8 shrink-0", props.class)}
        aria-label={props.label}
      >
        <Pencil size={16} />
      </DialogTrigger>
      <DialogContent class="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{props.title}</DialogTitle>
            <DialogDescription>{props.description}</DialogDescription>
          </DialogHeader>
          <TextFieldRoot
            value={name()}
            onChange={setName}
            validationState={error() ? "invalid" : "valid"}
            class="mt-4"
          >
            <TextField aria-label={props.fieldLabel} />
            <TextFieldErrorMessage>{error()}</TextFieldErrorMessage>
          </TextFieldRoot>
          <DialogFooter class="mt-4">
            {/* Kobalte labels every CloseButton "Dismiss" unless told otherwise. */}
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

export default RenameDialog;
