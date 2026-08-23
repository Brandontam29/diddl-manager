import { CircleX, Copy, Minus, Plus, Trash2 } from "lucide-solid";
import { type Component, Show, createMemo, createSignal } from "solid-js";

import {
  type DiddlCardItem,
  clearSelectedIds,
  getCardItemDiddlId,
  partitionCardItems,
  selectedCount,
  selectedItems,
} from "@/features/diddl";
import AddToListPopover from "@/features/lists/components/AddToListPopover";
import {
  type UpdateListItemsAction,
  runMutation,
  showToast,
  useListItemMutations,
} from "@/features/lists/mutations";
import { useListId } from "@/features/lists/useListId";
import { cn } from "@/libs/cn";
import { confettiStars } from "@/libs/confetti";

/**
 * The selection action bar (CONTEXT.md "Taskbar") over `items`, the cards currently
 * on the page. On the Library only "Add To List" applies; the List-page actions show
 * up once `$listId` is in the URL. The desktop's "Download images" is dropped (spec §1).
 */
const Taskbar: Component<{ items: DiddlCardItem[] }> = (props) => {
  const [open, setOpen] = createSignal(false);
  const { addListItems, updateListItems, duplicateListItems, bumpQuantity, removeListItems } =
    useListItemMutations();

  const selected = createMemo(() => selectedItems(props.items));
  const selectedListItemIds = createMemo(() => partitionCardItems(selected()).listItemIds);

  const id = useListId();
  const isHome = () => id() === null;

  const addToList = async (listId: number, origin?: Element) => {
    // Parity with the desktop (`list.addItems` is a plain insert): a Diddl already in
    // the list gets a second row rather than a quantity bump (spec §3 allows duplicates).
    const diddlIds = selected().map(getCardItemDiddlId);
    if (diddlIds.length === 0) return;

    try {
      await addListItems(listId, diddlIds);
    } catch (error) {
      console.error("addListItems failed", error);
      showToast("Could not add to the list", "destructive");
      return;
    }

    // Burst before clearing: clearing unmounts the Taskbar and detaches `origin`.
    confettiStars(origin);
    clearSelectedIds();
    setOpen(false);
    showToast(`Added ${diddlIds.length} to the list`);
  };

  const bumpSelected = (delta: number) => {
    const listId = id();
    if (listId === null) return;
    void runMutation(delta > 0 ? "Add 1" : "Remove 1", () =>
      bumpQuantity(listId, selected(), delta),
    );
  };

  const updateSelected = (label: string, action: UpdateListItemsAction) => () => {
    const listId = id();
    if (listId === null || selectedListItemIds().length === 0) return;

    void runMutation(label, () => updateListItems(listId, selectedListItemIds(), action));
  };

  const duplicateSelected = () => {
    if (selectedListItemIds().length === 0) return;
    void runMutation("Duplicate", () => duplicateListItems(selectedListItemIds()));
  };

  /** Drops the selected List Items outright, whatever their quantity. */
  const removeSelected = () => {
    const listId = id();
    const listItemIds = selectedListItemIds();
    if (listId === null || listItemIds.length === 0) return;

    void runMutation("Remove", async () => {
      const { removedCount } = await removeListItems(listId, listItemIds);
      showToast(`Removed ${removedCount} from the list`);
    });
  };

  const actionClass = "flex items-center gap-1 rounded-md px-2 py-1 hover:bg-gray-200";

  return (
    <div
      class={cn(
        "fixed top-0 right-4 left-4 z-40 flex flex-wrap items-center gap-2 md:right-8 md:left-64",
        "rounded-b-md border-x border-b-2 border-gray-300 bg-white px-2 py-1 shadow",
      )}
    >
      <button class={actionClass} onClick={clearSelectedIds}>
        <CircleX size={15} /> <span>{selectedCount()} Selected</span>
      </button>

      <div class="h-[24px] w-px bg-gray-200" />

      <AddToListPopover open={open()} onOpenChange={setOpen} onListClick={addToList} />

      <Show when={!isHome()}>
        <button class={actionClass} onClick={() => bumpSelected(1)}>
          <Plus />
          <span>Add 1</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />
        <button class={actionClass} onClick={() => bumpSelected(-1)}>
          <Minus />
          <span>Remove 1</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />
        <button class={actionClass} onClick={duplicateSelected}>
          <Copy size={16} />
          <span>Duplicate</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />
        <button
          class={actionClass}
          onClick={updateSelected("Set as Complete", { isIncomplete: false })}
        >
          <span>Set as Complete</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />
        <button
          class={actionClass}
          onClick={updateSelected("Set as Incomplete", { isIncomplete: true })}
        >
          <span>Set as Incomplete</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />
        <button class={actionClass} onClick={updateSelected("Set as Mint", { isDamaged: false })}>
          <span>Set as Mint</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />
        <button class={actionClass} onClick={updateSelected("Set as Damaged", { isDamaged: true })}>
          <span>Set as Damaged</span>
        </button>
        <div class="h-[24px] w-0.5 bg-gray-200" />
        <button class={actionClass} onClick={removeSelected}>
          <Trash2 size={16} />
          <span>Remove</span>
        </button>
      </Show>
    </div>
  );
};

export default Taskbar;
