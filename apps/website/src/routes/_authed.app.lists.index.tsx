import { createFileRoute } from "@tanstack/solid-router";
import { ListPlus } from "lucide-solid";

import { buttonVariants } from "@/components/ui/button";
import CreateListDialog from "@/features/lists/components/CreateListDialog";
import CreateSectionForm from "@/features/lists/components/list-sections/CreateSectionForm";
import ListSectionsBoard from "@/features/lists/components/list-sections/ListSectionsBoard";
import { useSectionMutations } from "@/features/lists/mutations";
import { cn } from "@/libs/cn";

/** The Sections board (desktop `/lists`): every List Section with its Lists, dnd-kit ordered. */
export const Route = createFileRoute("/_authed/app/lists/")({
  component: ListsPage,
});

function ListsPage() {
  const { createSection } = useSectionMutations();

  return (
    <div class="mx-auto w-full max-w-7xl px-4 py-8 max-md:pt-14">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 class="text-3xl font-bold">Lists</h1>

        <div class="flex flex-wrap items-start gap-2">
          <CreateSectionForm onCreate={createSection} />
          {/* The dialog trigger is already a button; the span only carries the look. */}
          <CreateListDialog>
            <span
              class={cn(
                buttonVariants({ variant: "outline" }),
                "flex items-center gap-2 rounded-md px-6",
              )}
            >
              <ListPlus size={20} />
              <span>Create New List</span>
            </span>
          </CreateListDialog>
        </div>
      </div>

      <ListSectionsBoard />
    </div>
  );
}
