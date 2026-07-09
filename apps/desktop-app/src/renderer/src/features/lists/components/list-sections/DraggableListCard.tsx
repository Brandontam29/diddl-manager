import { useDraggable, useDroppable } from "@dnd-kit/solid";
import { A } from "@solidjs/router";
import { Grip, X } from "lucide-solid";
import { type Component } from "solid-js";

import type { List } from "@shared";

import { cn } from "@renderer/libs/cn";

import ColorPickerPopover from "../ColorPickerPopover";
import DeleteListDialog from "../DeleteListDialog";
import ListCard from "../ListCard";
import type { DragData } from "./dragData";

const DraggableListCard: Component<{ list: List; sectionId: number }> = (props) => {
  const draggable = useDraggable<DragData>({
    get id() {
      return `list-${props.list.id}`;
    },
    get data() {
      return {
        type: "list" as const,
        listId: props.list.id,
        sectionId: props.sectionId,
      };
    },
  });
  const droppable = useDroppable<DragData>({
    get id() {
      return `list-drop-${props.list.id}`;
    },
    get data() {
      return {
        type: "list" as const,
        listId: props.list.id,
        sectionId: props.sectionId,
      };
    },
  });

  return (
    <div
      ref={(element) => {
        draggable.ref(element);
        droppable.ref(element);
      }}
      class={cn(
        "relative h-full",
        draggable.isDragging() && "opacity-60",
        droppable.isDropTarget() && "rounded-md ring-2 ring-primary",
      )}
    >
      <A href={`/lists/${props.list.id}`} class="h-full">
        <ListCard list={props.list} />
      </A>
      <button
        ref={draggable.handleRef}
        type="button"
        class="absolute top-0 left-0 cursor-grab rounded-md bg-background/40 p-1 text-muted-foreground shadow-sm hover:bg-background hover:text-foreground active:cursor-grabbing"
        aria-label={`Drag list ${props.list.name}`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <Grip size={16} />
      </button>
      <div class="absolute top-4 right-4">
        <DeleteListDialog listId={props.list.id} listName={props.list.name}>
          <X size={16} class="text-muted-foreground hover:text-destructive" />
        </DeleteListDialog>
      </div>
      <div class="absolute right-0 bottom-0">
        <ColorPickerPopover listId={props.list.id} currentColor={props.list.color} />
      </div>
    </div>
  );
};

export default DraggableListCard;
