import { Button } from "@kobalte/core/button";
import type { DialogTriggerProps } from "@kobalte/core/dialog";
import { useAction } from "@solidjs/router";
import { type Component, type JSX, createSignal } from "solid-js";

import type { List } from "@shared";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@renderer/components/ui/dialog";
import { TextField, TextFieldLabel, TextFieldRoot } from "@renderer/components/ui/textfield";

import { createListAction } from "../lists";

const CreateListDialog: Component<{
  children: JSX.Element;
  callback?: (list: List) => void;
}> = (props) => {
  const [open, setOpen] = createSignal(false);
  const [listName, setListName] = createSignal("");
  const [error, _setError] = createSignal("");
  const createList = useAction(createListAction);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    const list = await createList(listName(), []);
    if (list) {
      props?.callback?.(list);
    }
    setListName("");
    setOpen(false);
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
          <div>{error()}</div>

          <DialogFooter class="mt-4">
            <button type="submit">Create</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateListDialog;
