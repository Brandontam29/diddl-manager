import { useParams } from "@solidjs/router";
import { CheckCircle, Circle } from "lucide-solid";
import { type Component, For, Show, createMemo } from "solid-js";

import FallbackLoadingDiddl from "@renderer/components/fallback/FallbackLoadingDiddl";
import FallbackNoDiddl from "@renderer/components/fallback/FallbackNoDiddl";
import {
  type DiddlCardItem,
  diddlStore,
  getCardItemId,
  getCardItemName,
  getCardItemQuantity,
  isJoinedListItem,
} from "@renderer/features/diddl";
import DiddlCardUi from "@renderer/features/diddl/components/DiddlCardUi";
import { addSelectedIds, removeSelectedIds } from "@renderer/features/diddl/selectedIndicesMethods";
import { useCardHeight } from "@renderer/features/ui-state";
import { cn } from "@renderer/libs/cn";

import ListItemBadgesAndQuantity from "./ListItemBadgesAndQuantity";

const DiddlCards: Component<{
  items?: DiddlCardItem[] | null;
  highlightZeroQuantity?: boolean;
  showQuantityControls?: boolean;
}> = (props) => {
  const cardHeight = useCardHeight();
  const params = useParams();
  const listId = createMemo(() => (params.id === undefined ? null : parseInt(params.id)));
  const selectedIds = () => diddlStore.selectedIds;
  const isSelectMode = createMemo(() => selectedIds().length > 0);
  const itemIds = createMemo(() => props.items?.map(getCardItemId) ?? []);

  return (
    <Show when={Array.isArray(props.items)} fallback={<FallbackLoadingDiddl />}>
      <Show
        when={Array.isArray(props.items) && props.items!.length > 0}
        fallback={<FallbackNoDiddl />}
      >
        <For each={props.items}>
          {(item) => {
            const itemId = createMemo(() => getCardItemId(item));
            const isSelected = createMemo(() => selectedIds().includes(itemId()));
            const shouldShowQuantity = createMemo(
              () => props.showQuantityControls || isJoinedListItem(item),
            );
            const shouldHighlight = createMemo(
              () => props.highlightZeroQuantity && getCardItemQuantity(item) === 0,
            );
            const ratio =
              item.imageWidth && item.imageHeight ? item.imageWidth / item.imageHeight : null;

            return (
              <div
                class={cn("relative rounded")}
                style={{
                  height: `${cardHeight()}px`,
                  width: ratio ? `${cardHeight() * ratio}px` : undefined,
                }}
              >
                <DiddlCardUi
                  imagePath={item.imagePath}
                  name={getCardItemName(item)}
                  class="h-full w-full"
                  nameClass={shouldHighlight() ? "bg-gray-300 text-gray-950" : undefined}
                />
                <div
                  class={cn(
                    "inset-x absolute top-0 h-[calc(100%-20px)] w-full",
                    isSelectMode() &&
                      "group/card hover:bg-linear-to-t hover:from-black/25 hover:to-[48px]",
                  )}
                >
                  <div
                    class={cn(
                      "absolute inset-0 h-12 w-full bg-linear-to-b from-black/35 text-transparent opacity-0 hover:opacity-100",
                      !isSelectMode() && "hover:text-gray-200",
                      isSelectMode() && "opacity-100",
                      isSelected() && "from-transparent",
                    )}
                  >
                    <button
                      class={cn("absolute top-1.5 left-1.5 h-7 w-7 rounded-full")}
                      onClick={(e) => handleClick(itemId(), itemIds(), e)}
                    >
                      <Circle
                        class={cn(
                          "absolute inset-0 h-full w-full",
                          !isSelected() && isSelectMode() && "text-gray-200",
                        )}
                      />
                      <CheckCircle
                        class={cn(
                          "absolute inset-0 h-full w-full",
                          !isSelectMode() && "hover:text-white",
                          !isSelected() && isSelectMode() && "group-hover/card:text-white",
                          isSelected() && "rounded-full bg-blue-300 text-white",
                        )}
                      />
                    </button>
                  </div>
                  <Show when={isSelectMode()}>
                    <button
                      class={cn(
                        "absolute inset-0 h-full w-full rounded-t",
                        isSelected() && "border-[5px] border-blue-300",
                      )}
                      onClick={(e) => handleClick(itemId(), itemIds(), e)}
                    />
                  </Show>
                </div>
                <Show when={shouldShowQuantity()}>
                  <ListItemBadgesAndQuantity
                    item={item}
                    listId={listId()}
                    itemId={itemId()}
                    selectedIds={selectedIds()}
                    isSelectMode={isSelectMode()}
                    allItems={props.items!}
                  />
                </Show>
              </div>
            );
          }}
        </For>
      </Show>
    </Show>
  );
};

const handleClick = (id: string, itemIds: string[], event: MouseEvent) => {
  const selectedIds = diddlStore.selectedIds;

  if (event.shiftKey) {
    const lastClicked = selectedIds.at(-1);
    if (lastClicked === undefined) return;

    const idsBetween = getIdsBetween(itemIds, lastClicked, id);
    if (idsBetween.length === 0) return;

    if (shouldAdd(selectedIds, idsBetween)) {
      addSelectedIds(idsBetween);
      return;
    }

    removeSelectedIds(idsBetween);
    return;
  }

  if (!selectedIds.includes(id)) {
    addSelectedIds(id);
    return;
  }

  removeSelectedIds(id);
};

const shouldAdd = (selectedIds: string[], ids: string[]) => {
  return !ids.every((id) => selectedIds.includes(id));
};

const getIdsBetween = (itemIds: string[], a: string, b: string) => {
  const aIndex = itemIds.indexOf(a);
  const bIndex = itemIds.indexOf(b);

  if (aIndex === -1 || bIndex === -1) return [];

  return itemIds.slice(Math.min(aIndex, bIndex), Math.max(aIndex, bIndex) + 1);
};

export default DiddlCards;
