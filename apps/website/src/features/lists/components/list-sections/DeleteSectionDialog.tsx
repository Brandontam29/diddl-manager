import type { DialogTriggerProps } from "@kobalte/core/dialog";
import { Trash2 } from "lucide-solid";
import { type Component } from "solid-js";

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

import { runMutation, useSectionMutations } from "../../mutations";

const DeleteSectionDialog: Component<{ section: AppSection }> = (props) => {
  const { deleteSection } = useSectionMutations();

  return (
    <Dialog>
      <DialogTrigger
        as={(triggerProps: DialogTriggerProps) => (
          <Button
            {...triggerProps}
            variant="ghost"
            size="icon"
            aria-label={`Delete section ${props.section.name}`}
          >
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
          {/* Kobalte labels every CloseButton "Dismiss" unless told otherwise. */}
          <Dialog.CloseButton as={Button} variant="outline" aria-label="Cancel">
            Cancel
          </Dialog.CloseButton>
          <Dialog.CloseButton
            as={Button}
            variant="destructive"
            aria-label="Delete Section"
            onClick={() =>
              void runMutation("Delete section", () => deleteSection(props.section.id))
            }
          >
            Delete Section
          </Dialog.CloseButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSectionDialog;
