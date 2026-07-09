import { useAction } from "@solidjs/router";
import { CircleX, Minus, Plus } from "lucide-solid";
import { type Component, type JSX, Show } from "solid-js";

import { Button } from "@renderer/components/ui/button";
import {
  type DiddlCardItem,
  getCardItemDiddlId,
  getCardItemId,
  getCardItemListItemId,
  getCardItemQuantity,
  isJoinedListItem,
  setDiddlStore,
} from "@renderer/features/diddl";
import { addSelectedIds } from "@renderer/features/diddl/selectedIndicesMethods";
import { addListItemsAction, updateListItemsAction } from "@renderer/features/lists/list-items";
import { cn } from "@renderer/libs/cn";

type ListItemBadgesAndQuantityProps = {
  item: DiddlCardItem;
  itemId: string;
  listId: number | null;
  selectedIds: string[];
  isSelectMode: boolean;
  allItems: DiddlCardItem[];
};

const ListItemBadgesAndQuantity: Component<ListItemBadgesAndQuantityProps> = (props) => {
  const addListItems = useAction(addListItemsAction);
  const updateListItems = useAction(updateListItemsAction);

  const selectedItems = () => {
    if (!props.isSelectMode) return [props.item];

    const selectedIds = props.selectedIds.includes(props.itemId)
      ? props.selectedIds
      : [...props.selectedIds, props.itemId];

    return props.allItems.filter((item) => selectedIds.includes(getCardItemId(item)));
  };

  const onAdd = async () => {
    if (props.listId === null) return;

    const items = selectedItems();
    const listItemIds = items.map(getCardItemListItemId).filter((id): id is number => id !== null);
    const diddlIdsToCreate = items
      .filter((item) => getCardItemListItemId(item) === null)
      .map(getCardItemDiddlId);

    if (props.isSelectMode && !props.selectedIds.includes(props.itemId))
      addSelectedIds(props.itemId);

    if (listItemIds.length > 0) {
      await updateListItems(props.listId, listItemIds, { addQuantity: 1 });
    }

    if (diddlIdsToCreate.length > 0) {
      await addListItems(props.listId, diddlIdsToCreate);
      setDiddlStore("selectedIds", []);
    }
  };

  const onRemove = async () => {
    if (props.listId === null || getCardItemQuantity(props.item) <= 0) return;

    const items = selectedItems();
    const listItemIds = items.map(getCardItemListItemId).filter((id): id is number => id !== null);

    if (listItemIds.length === 0) return;
    if (props.isSelectMode && !props.selectedIds.includes(props.itemId))
      addSelectedIds(props.itemId);

    const result = await updateListItems(props.listId, listItemIds, { addQuantity: -1 });

    if (result?.data?.numDeletedRows) setDiddlStore("selectedIds", []);
  };

  return (
    <div class="absolute bottom-5 -left-1 space-y-px">
      <Show when={isJoinedListItem(props.item) && props.item.isDamaged}>
        <Badge dotColor="bg-red-400">Damaged</Badge>
      </Show>
      <Show when={isJoinedListItem(props.item) && props.item.isIncomplete}>
        <Badge dotColor="bg-yellow-400">Incomplete</Badge>
      </Show>
      <div class="flex w-min items-center divide-x rounded border border-gray-300 bg-gray-50">
        <Button
          variant="none"
          size="none"
          class={cn("h-5", getCardItemQuantity(props.item) > 0 && "hover:bg-pink-200")}
          disabled={getCardItemQuantity(props.item) <= 0}
          onClick={onRemove}
        >
          <Minus size={15} />
        </Button>
        <div class="w-8 px-1 text-sm">{getCardItemQuantity(props.item)}</div>
        <Button variant="none" size="none" class="h-5 hover:bg-pink-200" onClick={onAdd}>
          <Plus size={15} />
        </Button>
      </div>
    </div>
  );
};

const Badge: Component<{ dotColor?: string; children: JSX.Element; onClick?: () => void }> = (
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
