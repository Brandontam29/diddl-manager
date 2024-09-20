import { toaster } from "@kobalte/core/toast";
import { Toast, ToastContent, ToastProgress, ToastTitle } from "@renderer/components/ui/toast";
import { setLibraryStore, libraryStore } from "@renderer/features/library";
import { addListItems } from "@renderer/features/lists";
import AddToListPopover from "@renderer/features/lists/components/AddToListPopover";
import useAsyncCallback from "@renderer/hooks/useAsyncCallback";
import useScreenWidth from "@renderer/hooks/useScreenWidth";
import { cn } from "@renderer/libs/cn";
import { confettiStars } from "@renderer/libs/confetti";
import type { LibraryEntry } from "@shared/library-models";
import { Download, SplineIcon } from "lucide-solid";
import { BsBookmarkPlus } from "solid-icons/bs";
import { HiOutlineXCircle } from "solid-icons/hi";
import { createEffect, createSignal, type Component } from "solid-js";

const TaskbarLibrary: Component<{ diddls: LibraryEntry[] }> = (props) => {
  const screenWidth = useScreenWidth();
  const [open, setOpen] = createSignal(false);

  const onDownloadImages = async (e: MouseEvent & { target: HTMLButtonElement }) => {
    const diddlIds = libraryStore.selectedIndices.map((index) => props.diddls[index]?.id || "");
    const result = await window.api.downloadImages(diddlIds);

    if (!result) return;

    confettiStars(e);
    toaster.show((props) => (
      <Toast toastId={props.toastId}>
        <ToastContent>
          <ToastTitle>Toast</ToastTitle>
        </ToastContent>
        <ToastProgress />
      </Toast>
    ));
  };
  const { isLoading: downloadImagesIsLoading, handler: downloadImagesHandler } =
    useAsyncCallback(onDownloadImages);

  createEffect(() => console.log(downloadImagesIsLoading()));

  return (
    <div
      class={cn(
        "fixed top-0 left-[256px] flex items-center gap-2",
        "bg-white py-1 px-2 rounded-b-md border-x border-b-2 shadow border-gray-300",
      )}
      style={{ width: `${screenWidth() - 256 - 32}px` }}
    >
      <button
        class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
        onClick={async () => setLibraryStore("selectedIndices", [])}
      >
        <HiOutlineXCircle /> <span>{libraryStore.selectedIndices.length} Selected</span>
      </button>
      <div class="h-[24px] w-px bg-gray-200" />
      <button
        class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
        onClick={async () => {
          await addListItems(
            "collection",
            libraryStore.selectedIndices.map((index) => props.diddls[index]?.id || ""),
          );
          setLibraryStore("selectedIndices", []);
        }}
      >
        <BsBookmarkPlus />
        <span>Add to Collection</span>
      </button>
      <div class="h-[24px] w-px bg-gray-200" />

      <AddToListPopover
        open={open()}
        onOpenChange={setOpen}
        onListClick={async (listId) => {
          await addListItems(
            listId,
            libraryStore.selectedIndices.map((index) => props.diddls[index]?.id || ""),
          );
          setLibraryStore("selectedIndices", []);
          setOpen(false);
        }}
      />

      <div class="h-[24px] w-px bg-gray-200" />
      <button
        class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
        onClick={downloadImagesHandler}
      >
        {downloadImagesIsLoading() ? (
          <SplineIcon size={16} class="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        <span>Download</span>
      </button>
    </div>
  );
};

export default TaskbarLibrary;
