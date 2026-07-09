import type { DialogTriggerProps } from "@kobalte/core/dialog";
import { useAction } from "@solidjs/router";
import { Trash2 } from "lucide-solid";
import { type Component } from "solid-js";

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
import { deleteListSectionAction } from "@renderer/features/lists";

const DeleteSectionDialog: Component<{ section: ListSectionWithLists }> = (props) => {
  const deleteSection = useAction(deleteListSectionAction);

  return (
    <Dialog>
      <DialogTrigger
        as={(triggerProps: DialogTriggerProps) => (
          <Button {...triggerProps} variant="ghost" size="icon" aria-label="Delete section">
            <Trash2 size={16} />
          </Button>
        )}
      />
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Section</DialogTitle>
          <DialogDescription>
            Delete <strong>"{props.section.name}"</strong>? The lists in this section will be moved
            to <strong>Unsectioned</strong>. The lists will not be deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Dialog.CloseButton as={Button} variant="outline">
            Cancel
          </Dialog.CloseButton>
          <Dialog.CloseButton
            as={Button}
            variant="destructive"
            onClick={() => deleteSection(props.section.id)}
          >
            Delete Section
          </Dialog.CloseButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSectionDialog;
