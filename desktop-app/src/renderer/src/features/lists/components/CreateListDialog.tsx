import { Button } from "@kobalte/core/button";
import type { DialogTriggerProps } from "@kobalte/core/dialog";
import { useAction } from "@solidjs/router";
import { type Component, JSX, createSignal } from "solid-js";

import { List } from "@shared";

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
  const [listName, setListName] = createSignal("");
  const [error, _setError] = createSignal("");
  const createList = useAction(createListAction);

  return (
    <Dialog>
      <DialogTrigger
        as={(triggerProps: DialogTriggerProps) => (
          <Button {...triggerProps} variant="none">
            {props.children}
          </Button>
        )}
      />
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a New List</DialogTitle>
        </DialogHeader>

        <TextFieldRoot
          value={listName()}
          onChange={setListName}
          class="grid grid-cols-3 items-center gap-4 md:grid-cols-4"
        >
          <TextFieldLabel class="text-right">List Name</TextFieldLabel>
          <TextField class="col-span-2 md:col-span-3" />
        </TextFieldRoot>
        <div>{error()}</div>

        <DialogFooter>
          <Dialog.CloseButton
            onClick={async () => {
              const list = await createList(listName(), []);

              if (list) {
                props?.callback?.(list);
              }
            }}
            // setError(list.error.message);
          >
            Create
          </Dialog.CloseButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateListDialog;
