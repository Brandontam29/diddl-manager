import { setLibraryStore, libraryStore } from "@renderer/features/library";
import { addListItems } from "@renderer/features/lists";
import ListDialog from "@renderer/features/lists/components/ListDialog";
import useScreenWidth from "@renderer/hooks/useScreenWidth";
import { cn } from "@renderer/libs/cn";
import type { LibraryEntry } from "@shared/library-models";
import { BsBookmarkPlus } from "solid-icons/bs";
import { HiOutlineXCircle } from "solid-icons/hi";
import { TbDownload } from "solid-icons/tb";
import { createSignal, type Component } from "solid-js";

const TaskbarLibrary: Component<{ diddls: LibraryEntry[] }> = (props) => {
  const screenWidth = useScreenWidth();
  const [open, setOpen] = createSignal(false);

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
      <ListDialog
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
        onClick={async () => {}}
      >
        <TbDownload />
        <span>Download Images</span>
      </button>
    </div>
  );
};

export default TaskbarLibrary;
