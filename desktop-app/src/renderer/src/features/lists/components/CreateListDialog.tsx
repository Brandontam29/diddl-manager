import { Button } from "@kobalte/core/button";
import type { DialogTriggerProps } from "@kobalte/core/dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@renderer/components/ui/dialog";

import { type Component, createSignal, JSX } from "solid-js";
import { TextField, TextFieldLabel, TextFieldRoot } from "@renderer/components/ui/textfield";
import { fetchTrackerList } from "@renderer/features/lists";
import { List } from "@shared";

const CreateListDialog: Component<{
  children: JSX.Element;
  callback?: (list: List) => void;
}> = (props) => {
  const [listName, setListName] = createSignal("");
  const [error, setError] = createSignal("");

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
              const list = await window.api.createList(listName(), []);

              if (list) {
                props.callback && props.callback(list);
                fetchTrackerList();
                return;
              }

              // setError(list.error.message);
            }}
          >
            Create
          </Dialog.CloseButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateListDialog;
