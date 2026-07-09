import { ListPlus } from "lucide-solid";

import { Button } from "@renderer/components/ui/button";
import { CreateSectionForm, ListSectionsBoard } from "@renderer/features/lists";
import CreateListDialog from "@renderer/features/lists/components/CreateListDialog";

const ListsPage = () => {
  return (
    <div class="mx-auto w-full max-w-7xl px-4 py-8">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 class="text-3xl font-bold">Lists</h1>

        <div class="flex flex-wrap items-start gap-2">
          <CreateSectionForm />
          <CreateListDialog>
            <Button variant={"outline"} class="flex items-center gap-2 rounded-md px-6">
              <ListPlus size={20} />
              <span>Create New List</span>
            </Button>
          </CreateListDialog>
        </div>
      </div>

      <ListSectionsBoard />
    </div>
  );
};

export default ListsPage;
