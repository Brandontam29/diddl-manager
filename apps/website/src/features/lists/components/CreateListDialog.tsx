import { Button } from "@kobalte/core/button";
import type { DialogTriggerProps } from "@kobalte/core/dialog";
import { type Component, type JSX, createSignal } from "solid-js";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { listNameSchema } from "@/shared";

import { useListMutations } from "../mutations";

const CreateListDialog: Component<{
  children: JSX.Element;
  callback?: (list: { id: number; name: string }) => void;
}> = (props) => {
  const [open, setOpen] = createSignal(false);
  const [listName, setListName] = createSignal("");
  const [error, setError] = createSignal("");
  const { createList } = useListMutations();

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();

    const parsed = listNameSchema.safeParse(listName());
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid list name");
      return;
    }

    try {
      const list = await createList(parsed.data);
      props.callback?.(list);
      setListName("");
      setError("");
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the list");
    }
  };

  return (
    <Dialog open={open()} onOpenChange={setOpen}>
      <DialogTrigger
        as={(triggerProps: DialogTriggerProps) => (
          <Button {...triggerProps} variant="none">
            {props.children}
          </Button>
        )}
      />
      <DialogContent class="max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a New List</DialogTitle>
          </DialogHeader>

          <TextFieldRoot
            value={listName()}
            onChange={setListName}
            class="mt-4 grid grid-cols-3 items-center gap-4 md:grid-cols-4"
          >
            <TextFieldLabel class="text-right">List Name</TextFieldLabel>
            <TextField class="col-span-2 md:col-span-3" />
          </TextFieldRoot>
          <div class="mt-1 text-sm text-destructive">{error()}</div>

          <DialogFooter class="mt-4">
            <button type="submit">Create</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateListDialog;
