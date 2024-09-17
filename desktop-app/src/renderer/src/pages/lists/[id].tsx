import { libraryStore, setLibraryStore } from "@renderer/features/library";

import { createEffect, createMemo, Show } from "solid-js";
import { BsBookmarkDash } from "solid-icons/bs";
import DiddlCardList from "@renderer/components/DIddlCardList";
import { fetchListItems, listStore } from "@renderer/features/lists";
import { useParams } from "@solidjs/router";

import useScreenWidth from "@renderer/hooks/useScreenWidth";
import { cn } from "@renderer/libs/cn";
import { removeListItems } from "@renderer/features/lists/listMethods";

import { addListItems } from "@renderer/features/lists";
import ListDialog from "@renderer/features/lists/components/ListDialog";
import type { LibraryEntry } from "@shared/library-models";
import { BsBookmarkPlus } from "solid-icons/bs";
import { HiOutlineXCircle } from "solid-icons/hi";
import { TbDownload } from "solid-icons/tb";
import { createSignal, type Component } from "solid-js";

const ListIdPage = () => {
  const screenWidth = useScreenWidth();

  const params = useParams();
  const isSelectMode = createMemo(() => libraryStore.selectedIndices.length !== 0);

  const diddls = createMemo(() => {
    if (!listStore.listItems) return listStore.listItems;

    const entries = listStore.listItems.map((item) => {
      const index = libraryStore.libraryIndexMap[item.id];
      return { ...item, ...libraryStore.libraryState[index] };
    });

    return entries;
  });

  const listItem = createMemo(() => {
    return listStore.trackerListItems?.find((item) => item.id === params.id);
  });

  createEffect(() => {
    fetchListItems(params.id);
  });

  return (
    <>
      <div class={cn("flex flex-col")} style={{ width: `${screenWidth() - 256 - 32}px` }}>
        <Show when={listItem()}>
          <h1 class="pt-8 px-4 text-2xl font-bold">{listItem()?.name}</h1>
        </Show>
        <div class={cn("relative grow px-4 pt-8 pb-4 flex flex-wrap gap-2")}>
          <DiddlCardList diddls={diddls()} isListItem={true} />
        </div>
      </div>
      <Show when={isSelectMode()}>
        <Show when={diddls()}>
          <TaskbarList diddls={diddls()!} />
        </Show>
      </Show>
    </>
  );
};

const TaskbarList: Component<{ diddls: LibraryEntry[] }> = (props) => {
  const screenWidth = useScreenWidth();
  const [open, setOpen] = createSignal(false);
  const params = useParams();

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
          await removeListItems(
            params.id,
            libraryStore.selectedIndices.map((index) => props.diddls[index]?.id || ""),
          );

          setLibraryStore("selectedIndices", []);
        }}
      >
        <BsBookmarkDash />
        Remove
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

export default ListIdPage;
