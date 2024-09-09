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

import { type Component, createSignal } from "solid-js";
import { TextField, TextFieldLabel, TextFieldRoot } from "@renderer/components/ui/textfield";
import { FaSolidPlus } from "solid-icons/fa";
import { fetchTrackerList } from "@renderer/features/lists";

const CreateListDialog: Component = () => {
  const [listName, setListName] = createSignal("");
  return (
    <Dialog>
      <DialogTrigger
        as={(props: DialogTriggerProps) => (
          <Button class="grow flex items-center gap-2 px-2 py-1 hover:bg-gray-100 mr-4" {...props}>
            <FaSolidPlus />
            <span>Create New</span>
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

        <DialogFooter>
          <Dialog.CloseButton
            onClick={async () => {
              await window.api.createList(listName(), []);
              fetchTrackerList();
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
