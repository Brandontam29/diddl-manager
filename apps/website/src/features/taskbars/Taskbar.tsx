import { toaster } from "@kobalte/core/toast";
import { CircleX, Copy, Minus, Plus } from "lucide-solid";
import { type Component, Show, createMemo, createSignal } from "solid-js";

import { Toast, ToastContent, ToastProgress, ToastTitle } from "@/components/ui/toast";
import {
  type DiddlCardItem,
  clearSelectedIds,
  diddlStore,
  getCardItemDiddlId,
  getCardItemId,
  getCardItemListItemId,
} from "@/features/diddl";
import AddToListPopover from "@/features/lists/components/AddToListPopover";
import { useListItemMutations } from "@/features/lists/mutations";
import { useListId } from "@/features/lists/useListId";
import { cn } from "@/libs/cn";
import { confettiStars } from "@/libs/confetti";

const showToast = (title: string, variant: "default" | "destructive" = "default") =>
  toaster.show((props) => (
    <Toast toastId={props.toastId} variant={variant}>
      <ToastContent>
        <ToastTitle>{title}</ToastTitle>
      </ToastContent>
      <ToastProgress />
    </Toast>
  ));

/**
 * The selection action bar (CONTEXT.md "Taskbar"). On the Library only "Add To List"
 * applies; the List-page actions show up once `$listId` is in the URL. The desktop's
 * "Download images" action is dropped (spec §1).
 */
const Taskbar: Component<{
  diddls?: DiddlCardItem[];
  items?: DiddlCardItem[];
}> = (props) => {
  const [open, setOpen] = createSignal(false);
  const { addListItems, updateListItems, duplicateListItems } = useListItemMutations();

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

  const id = useListId();
  const isHome = () => id() === null;

  const addToList = async (listId: number, origin?: Element) => {
    const count = selectedDiddlIds().length;
    if (count === 0) return;

    try {
      await addListItems(listId, selectedDiddlIds());
    } catch (error) {
      console.error("addListItems failed", error);
      showToast("Could not add to the list", "destructive");
      return;
    }

    clearSelectedIds();
    setOpen(false);
    confettiStars(origin);
    showToast(`Added ${count} to the list`);
  };

  const addOneToCurrentList = async () => {
    const listId = id();

    if (listId === null) return;

    if (selectedListItemIds().length > 0) {
      await updateListItems(listId, selectedListItemIds(), { addQuantity: 1 });
    }

    if (selectedCatalogDiddlIds().length > 0) {
      await addListItems(listId, selectedCatalogDiddlIds());
      clearSelectedIds();
    }
  };

  const updateSelected = (action: Parameters<typeof updateListItems>[2]) => async () => {
    const listId = id();

    if (listId === null || selectedListItemIds().length === 0) return;

    const result = await updateListItems(listId, selectedListItemIds(), action);

    if (result.removedCount > 0) clearSelectedIds();
  };

  return (
    <div
      class={cn(
        "fixed top-0 right-4 left-4 z-40 flex flex-wrap items-center gap-2 md:right-8 md:left-64",
        "rounded-b-md border-x border-b-2 border-gray-300 bg-white px-2 py-1 shadow",
      )}
    >
      <button
        class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
        onClick={clearSelectedIds}
      >
        <CircleX size={15} /> <span>{diddlStore.selectedIds.length} Selected</span>
      </button>

      <div class="h-[24px] w-px bg-gray-200" />

      <AddToListPopover open={open()} onOpenChange={setOpen} onListClick={addToList} />

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
          onClick={updateSelected({ addQuantity: -1 })}
        >
          <Minus />
          <span>Remove 1</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
          onClick={() => {
            if (selectedListItemIds().length === 0) return;
            void duplicateListItems(selectedListItemIds());
          }}
        >
          <Copy size={16} />
          <span>Duplicate</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
          onClick={updateSelected({ isIncomplete: false })}
        >
          <span>Set as Complete</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
          onClick={updateSelected({ isIncomplete: true })}
        >
          <span>Set as Incomplete</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
          onClick={updateSelected({ isDamaged: false })}
        >
          <span>Set as Mint</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />
        <button
          class="flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200"
          onClick={updateSelected({ isDamaged: true })}
        >
          <span>Set as Damaged</span>
        </button>
      </Show>
    </div>
  );
};

export default Taskbar;
