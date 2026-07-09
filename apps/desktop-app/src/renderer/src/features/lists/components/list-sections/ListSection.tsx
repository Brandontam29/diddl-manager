import { useDraggable, useDroppable } from "@dnd-kit/solid";
import { Grip } from "lucide-solid";
import { type Component, For, Show } from "solid-js";

import type { ListSectionWithLists } from "@shared";

import { cn } from "@renderer/libs/cn";

import DeleteSectionDialog from "./DeleteSectionDialog";
import DraggableListCard from "./DraggableListCard";
import RenameSectionDialog from "./RenameSectionDialog";
import type { DragData } from "./dragData";

const ListSection: Component<{ section: ListSectionWithLists }> = (props) => {
  const draggable = useDraggable<DragData>({
    get id() {
      return `section-${props.section.id}`;
    },
    get data() {
      return { type: "section" as const, sectionId: props.section.id };
    },
  });
  const droppable = useDroppable<DragData>({
    get id() {
      return `section-drop-${props.section.id}`;
    },
    get data() {
      return { type: "section" as const, sectionId: props.section.id };
    },
  });

  return (
    <section
      ref={(element) => {
        draggable.ref(element);
        droppable.ref(element);
      }}
      class={cn(
        "rounded-md border bg-background p-4",
        draggable.isDragging() && "opacity-60",
        droppable.isDropTarget() && "ring-2 ring-primary",
      )}
    >
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <button
          ref={draggable.handleRef}
          type="button"
          class="cursor-grab rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing"
          aria-label={`Drag ${props.section.name}`}
        >
          <Grip size={18} />
        </button>
        <span class="flex items-baseline gap-2">
          <h2 class="text-xl font-semibold">{props.section.name}</h2>
          <span class="text-sm text-muted-foreground">{props.section.lists.length} lists</span>
        </span>

        <Show when={!props.section.isDefault}>
          <div class="ml-auto flex items-center gap-2">
            <RenameSectionDialog section={props.section} />
            <DeleteSectionDialog section={props.section} />
          </div>
        </Show>
      </div>

      <Show
        when={props.section.lists.length > 0}
        fallback={
          <div class="flex min-h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
            Drop lists here
          </div>
        }
      >
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <For each={props.section.lists}>
            {(item) => <DraggableListCard list={item} sectionId={props.section.id} />}
          </For>
        </div>
      </Show>
    </section>
  );
};

export default ListSection;
