import { useAction } from "@solidjs/router";
import { CircleX, Minus, Plus } from "lucide-solid";
import { type Component, type JSX, Show } from "solid-js";

import type { Diddl, JoinedListItem } from "@shared";

import { Button } from "@renderer/components/ui/button";
import { setDiddlStore } from "@renderer/features/diddl";
import { addSelectedIndices } from "@renderer/features/diddl/selectedIndicesMethods";
import { updateListItemsAction } from "@renderer/features/lists/list-items";
import { cn } from "@renderer/libs/cn";

type CardItem = Diddl | JoinedListItem;

type ListItemBadgesAndQuantityProps = {
  item: JoinedListItem;
  listId: number | null;
  index: number;
  selectedIndices: number[];
  isSelectMode: boolean;
  allItems: CardItem[];
};

const ListItemBadgesAndQuantity: Component<ListItemBadgesAndQuantityProps> = (props) => {
  const updateListItems = useAction(updateListItemsAction);

  return (
    <div class="absolute bottom-5 -left-1 space-y-px">
      <Show when={props.item.isDamaged}>
        <Badge dotColor="bg-red-400">Damaged</Badge>
      </Show>
      <Show when={props.item.isIncomplete}>
        <Badge dotColor="bg-yellow-400">Incomplete</Badge>
      </Show>
      <div class="flex w-min items-center divide-x rounded border border-gray-300 bg-gray-50">
        <Button
          variant="none"
          size="none"
          class="h-5 hover:bg-pink-200"
          onClick={async () => {
            if (props.listId === null) return;

            if (!props.isSelectMode) {
              updateListItems(props.listId, [props.item.listItemId], {
                addQuantity: -1,
              });
              return;
            }

            if (!props.selectedIndices.includes(props.index)) addSelectedIndices(props.index);

            const result = await updateListItems(
              props.listId,
              props.selectedIndices.map(
                (i) => (props.allItems[i] as JoinedListItem)?.listItemId || -1,
              ),
              { addQuantity: -1 },
            );

            if (result?.data?.numDeletedRows) setDiddlStore("selectedIndices", []);
          }}
        >
          <Minus size={15} />
        </Button>
        <div class="w-8 px-1 text-sm">{props.item.quantity}</div>
        <Button
          variant="none"
          size="none"
          class="h-5 hover:bg-pink-200"
          onClick={() => {
            if (props.listId === null) return;

            if (!props.isSelectMode) {
              updateListItems(props.listId, [props.item.listItemId], {
                addQuantity: 1,
              });
              return;
            }

            if (!props.selectedIndices.includes(props.index)) addSelectedIndices(props.index);

            updateListItems(
              props.listId,
              props.selectedIndices.map(
                (i) => (props.allItems[i] as JoinedListItem)?.listItemId || -1,
              ),
              { addQuantity: 1 },
            );
          }}
        >
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
