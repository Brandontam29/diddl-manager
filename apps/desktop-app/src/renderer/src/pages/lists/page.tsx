import { toaster } from "@kobalte/core/toast";
import { FileJson, ListPlus } from "lucide-solid";

import { Button } from "@renderer/components/ui/button";
import { Toast, ToastContent, ToastProgress, ToastTitle } from "@renderer/components/ui/toast";
import { CreateSectionForm, ListSectionsBoard } from "@renderer/features/lists";
import CreateListDialog from "@renderer/features/lists/components/CreateListDialog";
import createAsyncCallback from "@renderer/hooks/createAsyncCallback";
import { trpc } from "@renderer/libs/trpc";

const ListsPage = () => {
  const { isLoading: exportIsLoading, handler: exportLists } = createAsyncCallback(async () => {
    const result = await trpc.fileSystem.exportLists.mutate();
    if (!result.success) return;

    toaster.show((props) => (
      <Toast toastId={props.toastId}>
        <ToastContent>
          <ToastTitle>Lists exported to {result.filePath}</ToastTitle>
        </ToastContent>
        <ToastProgress />
      </Toast>
    ));
  });

  return (
    <div class="mx-auto w-full max-w-7xl px-4 py-8">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 class="text-3xl font-bold">Lists</h1>

        <div class="flex flex-wrap items-start gap-2">
          <CreateSectionForm />
          <Button
            variant={"outline"}
            class="flex items-center gap-2 rounded-md px-6"
            disabled={exportIsLoading()}
            onClick={exportLists}
          >
            <FileJson size={20} />
            <span>Export JSON</span>
          </Button>
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
