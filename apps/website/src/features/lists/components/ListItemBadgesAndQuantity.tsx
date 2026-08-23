import { CircleX, Minus, Plus } from "lucide-solid";
import { type Component, type JSX, Show } from "solid-js";

import { Button } from "@/components/ui/button";
import {
  type DiddlCardItem,
  addSelectedIds,
  getCardItemId,
  getCardItemQuantity,
  isJoinedListItem,
  isSelectMode,
  isSelected,
  selectedItems,
} from "@/features/diddl";
import { runMutation, useListItemMutations } from "@/features/lists/mutations";
import { cn } from "@/libs/cn";

type ListItemBadgesAndQuantityProps = {
  item: DiddlCardItem;
  listId: number | null;
  allItems: DiddlCardItem[];
};

/**
 * The +/- quantity control and status badges of one card. In select mode the
 * control acts on the whole selection (joining this card to it first).
 */
const ListItemBadgesAndQuantity: Component<ListItemBadgesAndQuantityProps> = (props) => {
  const { bumpQuantity } = useListItemMutations();

  const targets = () => {
    if (!isSelectMode()) return [props.item];
    if (!isSelected(props.item)) addSelectedIds(getCardItemId(props.item));
    return selectedItems(props.allItems);
  };

  const bump = (delta: number) => {
    const listId = props.listId;
    if (listId === null) return;
    if (delta < 0 && getCardItemQuantity(props.item) <= 0) return;

    void runMutation(delta > 0 ? "Add 1" : "Remove 1", () =>
      bumpQuantity(listId, targets(), delta),
    );
  };

  return (
    <div class="absolute bottom-5 -left-1 space-y-px">
      <Show when={isJoinedListItem(props.item) && props.item.isDamaged}>
        <StatusBadge dotColor="bg-red-400">Damaged</StatusBadge>
      </Show>
      <Show when={isJoinedListItem(props.item) && props.item.isIncomplete}>
        <StatusBadge dotColor="bg-yellow-400">Incomplete</StatusBadge>
      </Show>
      <div class="flex w-min items-center divide-x rounded border border-gray-300 bg-gray-50">
        <Button
          variant="none"
          size="none"
          class={cn("h-5", getCardItemQuantity(props.item) > 0 && "hover:bg-pink-200")}
          disabled={getCardItemQuantity(props.item) <= 0}
          onClick={() => bump(-1)}
        >
          <Minus size={15} />
        </Button>
        <div class="w-8 px-1 text-sm">{getCardItemQuantity(props.item)}</div>
        <Button variant="none" size="none" class="h-5 hover:bg-pink-200" onClick={() => bump(1)}>
          <Plus size={15} />
        </Button>
      </div>
    </div>
  );
};

const StatusBadge: Component<{ dotColor?: string; children: JSX.Element; onClick?: () => void }> = (
  props,
) => (
  <Button
    variant={"none"}
    size={"none"}
    class={cn(
      "flex w-min cursor-default items-center gap-px rounded border border-gray-300 bg-gray-50 p-px",
      props.onClick && "group/card cursor-pointer",
    )}
    onClick={props.onClick}
  >
    <Show when={props.dotColor}>
      <div
        class={cn(
          "aspect-square h-2 rounded-full border border-gray-300",
          props.onClick && "group/card-hover:hidden",
          props.dotColor,
        )}
      />
      <CircleX
        size={8}
        class={cn("hidden aspect-square h-2", props.onClick && "group/card-hover:block")}
      />
    </Show>
    <div class="text-sm">{props.children}</div>
  </Button>
);

export default ListItemBadgesAndQuantity;
