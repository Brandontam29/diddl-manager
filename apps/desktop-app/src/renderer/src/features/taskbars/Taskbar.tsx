import { toaster } from "@kobalte/core/toast";
import { useAction, useMatch, useParams } from "@solidjs/router";
import { CircleX, Copy, Download, Minus, Plus, SplineIcon } from "lucide-solid";
import { type Component, type JSX, Show, createMemo, createSignal } from "solid-js";

import { Toast, ToastContent, ToastProgress, ToastTitle } from "@renderer/components/ui/toast";
import {
  type DiddlCardItem,
  diddlStore,
  getCardItemDiddlId,
  getCardItemId,
  getCardItemListItemId,
  setDiddlStore,
} from "@renderer/features/diddl";
import {
  addListItemsAction,
  duplicateListItemAction,
  updateListItemsAction,
} from "@renderer/features/lists";
import AddToListPopover from "@renderer/features/lists/components/AddToListPopover";
import createAsyncCallback from "@renderer/hooks/createAsyncCallback";
import useScreenWidth from "@renderer/hooks/useScreenWidth";
import { cn } from "@renderer/libs/cn";
import { confettiStars } from "@renderer/libs/confetti";
import { trpc } from "@renderer/libs/trpc";

const Taskbar: Component<{
  diddls?: DiddlCardItem[];
  items?: DiddlCardItem[];
}> = (props) => {
  const screenWidth = useScreenWidth();
  const [open, setOpen] = createSignal(false);
  const updateListItems = useAction(updateListItemsAction);
  const addListItems = useAction(addListItemsAction);
  const duplicateListItems = useAction(duplicateListItemAction);

  const allItems = createMemo(() => props.items ?? props.diddls ?? []);
  const selectedItems = createMemo(() =>
    allItems().filter((item) => diddlStore.selectedIds.includes(getCardItemId(item))),
  );
  const selectedDiddlIds = createMemo(() => selectedItems().map(getCardItemDiddlId));
  const selectedListItemIds = createMemo(() =>
    selectedItems()
      .map(getCardItemListItemId)
      .filter((id): id is number => id !== null),
  );
  const selectedCatalogDiddlIds = createMemo(() =>
    selectedItems()
      .filter((item) => getCardItemListItemId(item) === null)
      .map(getCardItemDiddlId),
  );

  const onDownloadImages: JSX.EventHandler<HTMLButtonElement, MouseEvent> = async (e) => {
    const result = await trpc.fileSystem.downloadImages.mutate({ diddlIds: selectedDiddlIds() });

    if (!result) return;

    confettiStars(e);
    toaster.show((props) => (
      <Toast toastId={props.toastId}>
        <ToastContent>
          <ToastTitle>Sucessfully Downloaded</ToastTitle>
        </ToastContent>
        <ToastProgress />
      </Toast>
    ));
  };

  const { isLoading: downloadImagesIsLoading, handler: downloadImagesHandler } =
    createAsyncCallback(onDownloadImages);

  const isHome = useMatch(() => "/");
  const params = useParams();
  const id = createMemo(() => (params.id === undefined ? null : parseInt(params.id)));

  const addOneToCurrentList = async () => {
    const listId = id();

    if (listId === null) return;

    if (selectedListItemIds().length > 0) {
      await updateListItems(listId, selectedListItemIds(), { addQuantity: 1 });
    }

    if (selectedCatalogDiddlIds().length > 0) {
      await addListItems(listId, selectedCatalogDiddlIds());
      setDiddlStore("selectedIds", []);
    }
  };

  return (
    <div
      class={cn(
        "fixed top-0 left-[256px] flex items-center gap-2",
        "rounded-b-md border-x border-b-2 border-gray-300 bg-white px-2 py-1 shadow",
      )}
      style={{ width: `${screenWidth() - 256 - 32}px` }}
    >
      <button
        class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
        onClick={() => setDiddlStore("selectedIds", [])}
      >
        <CircleX size={15} /> <span>{diddlStore.selectedIds.length} Selected</span>
      </button>

      <div class="h-[24px] w-px bg-gray-200" />

      <AddToListPopover
        open={open()}
        onOpenChange={setOpen}
        onListClick={async (listId) => {
          await addListItems(listId, selectedDiddlIds());
          setDiddlStore("selectedIds", []);
          setOpen(false);
        }}
      />

      <Show when={!isHome()}>
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
          onClick={addOneToCurrentList}
        >
          <Plus />
          <span>Add 1</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
          onClick={async () => {
            const listId = id();

            if (listId === null || selectedListItemIds().length === 0) return;

            const result = await updateListItems(listId, selectedListItemIds(), {
              addQuantity: -1,
            });

            if (result?.data?.numDeletedRows) setDiddlStore("selectedIds", []);
          }}
        >
          <Minus />
          <span>Remove 1</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />{" "}
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
          onClick={() => {
            if (selectedListItemIds().length === 0) return;
            duplicateListItems(selectedListItemIds());
          }}
        >
          <Copy size={16} />
          <span>Duplicate</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />{" "}
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
          onClick={() => {
            const listId = id();

            if (listId === null || selectedListItemIds().length === 0) return;

            updateListItems(listId, selectedListItemIds(), { isIncomplete: false });
          }}
        >
          <span>Set as Complete</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />{" "}
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
          onClick={() => {
            const listId = id();

            if (listId === null || selectedListItemIds().length === 0) return;

            updateListItems(listId, selectedListItemIds(), { isIncomplete: true });
          }}
        >
          <span>Set as Incomplete</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />{" "}
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
          onClick={() => {
            const listId = id();

            if (listId === null || selectedListItemIds().length === 0) return;

            updateListItems(listId, selectedListItemIds(), { isDamaged: false });
          }}
        >
          <span>Set as Mint</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />{" "}
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
          onClick={() => {
            const listId = id();

            if (listId === null || selectedListItemIds().length === 0) return;

            updateListItems(listId, selectedListItemIds(), { isDamaged: true });
          }}
        >
          <span>Set as Damaged</span>
        </button>
      </Show>

      <div class="h-[24px] w-px bg-gray-200" />
      <button
        class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
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

export default Taskbar;
