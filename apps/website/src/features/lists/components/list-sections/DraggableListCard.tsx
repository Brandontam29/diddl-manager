import { useDraggable, useDroppable } from "@dnd-kit/solid";
import { Link } from "@tanstack/solid-router";
import { Grip, X } from "lucide-solid";
import { type Component } from "solid-js";

import type { AppList } from "@/features/app-data";
import { cn } from "@/libs/cn";
import { listNameSchema } from "@/shared";

import ColorPickerPopover from "../ColorPickerPopover";
import ConfirmDeleteDialog from "../ConfirmDeleteDialog";
import ListCard from "../ListCard";
import RenameDialog from "../RenameDialog";
import type { ListActions } from "./ListSectionsBoard";
import type { DragData } from "./dragData";

const DraggableListCard: Component<{ list: AppList; sectionId: number; actions: ListActions }> = (
  props,
) => {
  const data = (): DragData => ({
    type: "list",
    listId: props.list.id,
    sectionId: props.sectionId,
  });

  const draggable = useDraggable<DragData>({
    get id() {
      return `list-${props.list.id}`;
    },
    get data() {
      return data();
    },
  });
  const droppable = useDroppable<DragData>({
    get id() {
      return `list-drop-${props.list.id}`;
    },
    get data() {
      return data();
    },
  });

  return (
    <div
      ref={(element) => {
        draggable.ref(element);
        droppable.ref(element);
      }}
      data-testid={`list-card-${props.list.id}`}
      class={cn(
        "group/card relative h-full",
        draggable.isDragging() && "opacity-60",
        droppable.isDropTarget() && "rounded-md ring-2 ring-primary",
      )}
    >
      <Link to="/app/lists/$listId" params={{ listId: props.list.id }} class="block h-full">
        <ListCard list={props.list} />
      </Link>
      <button
        ref={draggable.handleRef}
        type="button"
        class="absolute top-0 left-0 cursor-grab rounded-md bg-background/40 p-1 text-muted-foreground shadow-sm hover:bg-background hover:text-foreground active:cursor-grabbing"
        aria-label={`Drag list ${props.list.name}`}
      >
        <Grip size={16} />
      </button>
      <div class="absolute top-2 right-2">
        <ConfirmDeleteDialog
          title="Delete List"
          description={
            <>
              Are you sure you want to delete <strong>"{props.list.name}"</strong>? This action
              cannot be undone.
            </>
          }
          label={`Delete list ${props.list.name}`}
          confirmLabel="Delete"
          class="h-8 w-8 text-muted-foreground hover:text-destructive"
          onConfirm={() => props.actions.deleteList(props.list.id)}
        >
          <X size={16} />
        </ConfirmDeleteDialog>
      </div>
      <div class="absolute top-2 right-10">
        <RenameDialog
          title="Rename List"
          description="List names must be valid and unique."
          label={`Rename list ${props.list.name}`}
          fieldLabel="List name"
          initialName={props.list.name}
          schema={listNameSchema}
          onSubmit={(name) => props.actions.renameList(props.list.id, name)}
          class="opacity-0 transition-opacity group-focus-within/card:opacity-100 group-hover/card:opacity-100 focus-visible:opacity-100"
        />
      </div>
      <div class="absolute right-0 bottom-0">
        <ColorPickerPopover
          currentColor={props.list.color}
          onSelect={(color) => props.actions.updateListColor(props.list.id, color)}
        />
      </div>
    </div>
  );
};

export default DraggableListCard;
