import { useDraggable, useDroppable } from "@dnd-kit/solid";
import { Grip, Trash2 } from "lucide-solid";
import { type Component, For, Show } from "solid-js";

import type { AppSection } from "@/features/app-data";
import { cn } from "@/libs/cn";
import { listSectionNameSchema } from "@/shared";

import { useSectionMutations } from "../../mutations";
import ConfirmDeleteDialog from "../ConfirmDeleteDialog";
import RenameDialog from "../RenameDialog";
import DraggableListCard from "./DraggableListCard";
import type { ListActions } from "./ListSectionsBoard";
import type { DragData } from "./dragData";

const ListSection: Component<{ section: AppSection; actions: ListActions }> = (props) => {
  const { renameSection, deleteSection } = useSectionMutations();
  const data = (): DragData => ({ type: "section", sectionId: props.section.id });

  const draggable = useDraggable<DragData>({
    get id() {
      return `section-${props.section.id}`;
    },
    get data() {
      return data();
    },
  });
  const droppable = useDroppable<DragData>({
    get id() {
      return `section-drop-${props.section.id}`;
    },
    get data() {
      return data();
    },
  });

  return (
    <section
      ref={(element) => {
        draggable.ref(element);
        droppable.ref(element);
      }}
      data-testid={`section-${props.section.id}`}
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
            <RenameDialog
              title="Rename Section"
              description="Section names must be unique."
              label={`Rename section ${props.section.name}`}
              fieldLabel="Section name"
              initialName={props.section.name}
              schema={listSectionNameSchema}
              onSubmit={(name) => renameSection(props.section.id, name)}
            />
            <ConfirmDeleteDialog
              title="Delete Section"
              description={
                <>
                  Delete <strong>"{props.section.name}"</strong>? The lists in this section will be
                  moved to <strong>Unsectioned</strong>. The lists will not be deleted.
                </>
              }
              label={`Delete section ${props.section.name}`}
              confirmLabel="Delete Section"
              onConfirm={() => deleteSection(props.section.id)}
            >
              <Trash2 size={16} />
            </ConfirmDeleteDialog>
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
            {(item) => (
              <DraggableListCard list={item} sectionId={props.section.id} actions={props.actions} />
            )}
          </For>
        </div>
      </Show>
    </section>
  );
};

export default ListSection;
