import { libraryStore, setLibraryStore } from "@renderer/features/library";
import useScreenWidth from "@renderer/hooks/useScreenWidth";
import { cn } from "@renderer/libs/cn";
import { LibraryEntry } from "@shared/library-models";
import { useParams } from "@solidjs/router";
import { Plus, Minus } from "lucide-solid";
import { BsBookmarkDash, BsBookmarkPlus } from "solid-icons/bs";
import { HiOutlineXCircle } from "solid-icons/hi";
import { Component, createSignal } from "solid-js";
import { removeListItems, addListItems, updateListItems } from "../listMethods";
import AddToListPopover from "./AddToListPopover";

const TaskbarList: Component<{ diddls: LibraryEntry[] }> = (props) => {
  const screenWidth = useScreenWidth();
  const [open, setOpen] = createSignal(false);
  const params = useParams();
  const selectedIndices = () => libraryStore.selectedIndices;

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
        onClick={() => {
          updateListItems(
            params.id,
            selectedIndices().map((i) => props.diddls![i].id),
            { addCount: 1 },
          );
        }}
      >
        <Plus />
        <span>Add 1</span>
      </button>
      <div class="h-[24px] w-px bg-gray-200" />
      <button
        class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
        onClick={() => {
          updateListItems(
            params.id,
            selectedIndices().map((i) => props.diddls![i].id),
            { addCount: -1 },
          );
        }}
      >
        <Minus />
        <span>Remove 1</span>
      </button>
      <div class="h-[24px] w-px bg-gray-200" />{" "}
      <button
        class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
        onClick={() => {
          updateListItems(
            params.id,
            selectedIndices().map((i) => props.diddls![i].id),
            { isIncomplete: false },
          );
        }}
      >
        <Plus />
        <span>Mark as Complete</span>
      </button>
      <div class="h-[24px] w-px bg-gray-200" />{" "}
      <button
        class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
        onClick={() => {
          updateListItems(
            params.id,
            selectedIndices().map((i) => props.diddls![i].id),
            { isIncomplete: true },
          );
        }}
      >
        <Minus />
        <span>Mark as Incomplete</span>
      </button>
      <div class="h-[24px] w-px bg-gray-200" />{" "}
      <button
        class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
        onClick={() => {
          updateListItems(
            params.id,
            selectedIndices().map((i) => props.diddls![i].id),
            { isDamaged: false },
          );
        }}
      >
        <Plus />
        <span>Mark as Mint</span>
      </button>
      <div class="h-[24px] w-px bg-gray-200" />{" "}
      <button
        class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
        onClick={() => {
          updateListItems(
            params.id,
            selectedIndices().map((i) => props.diddls![i].id),
            { isDamaged: true },
          );
        }}
      >
        <Minus />
        <span>Mark as Damaged</span>
      </button>
      {/* <button
          class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
          onClick={async () => {}}
        >
          <TbDownload />
          <span>Download Images</span>
        </button> */}
    </div>
  );
};

export default TaskbarList;
