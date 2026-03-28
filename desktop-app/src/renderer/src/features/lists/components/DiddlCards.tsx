import { useParams } from "@solidjs/router";
import { CheckCircle, Circle } from "lucide-solid";
import { type Component, For, Show, createEffect, createMemo } from "solid-js";

import type { Diddl, JoinedListItem } from "@shared";

import FallbackLoadingDiddl from "@renderer/components/fallback/FallbackLoadingDiddl";
import FallbackNoDiddl from "@renderer/components/fallback/FallbackNoDiddl";
import { diddlStore } from "@renderer/features/diddl";
import DiddlCardUi from "@renderer/features/diddl/components/DiddlCardUi";
import { diddlListColors, diffDiddlIds } from "@renderer/features/diddl/diffMode";
import {
  addSelectedIndices,
  removeSelectedIndices,
} from "@renderer/features/diddl/selectedIndicesMethods";
import { uiStore } from "@renderer/features/settings/legacy-index";
import { cn } from "@renderer/libs/cn";

import ListItemBadgesAndQuantity from "./ListItemBadgesAndQuantity";

type CardItem = Diddl | JoinedListItem;

const isJoinedListItem = (item: CardItem): item is JoinedListItem => "listItemId" in item;

const getItemName = (item: CardItem) => (isJoinedListItem(item) ? item.diddlName : item.name);

const getItemDiddlId = (item: CardItem) => (isJoinedListItem(item) ? item.diddlId : item.id);

const DiddlCards: Component<{
  items?: CardItem[] | null;
}> = (props) => {
  const params = useParams();
  const listId = createMemo(() => (params.id === undefined ? null : parseInt(params.id)));
  const selectedIndices = () => diddlStore.selectedIndices;
  const isSelectMode = createMemo(() => selectedIndices().length > 0);
  const isDiffMode = createMemo(() => diddlStore.diffListIds.length > 0);

  return (
    <Show when={Array.isArray(props.items)} fallback={<FallbackLoadingDiddl />}>
      <Show
        when={Array.isArray(props.items) && props.items!.length > 0}
        fallback={<FallbackNoDiddl />}
      >
        <For each={props.items}>
          {(item, index) => {
            const ratio =
              item.imageWidth && item.imageHeight ? item.imageWidth / item.imageHeight : null;
            const isGrayedOut = createMemo(() => {
              const ids = diffDiddlIds();
              return isDiffMode() && ids !== null && !ids.has(getItemDiddlId(item));
            });
            const cardColors = createMemo(() =>
              isDiffMode() ? (diddlListColors().get(getItemDiddlId(item)) ?? []) : [],
            );

            return (
              <div
                class={cn("relative rounded")}
                style={{
                  height: `${uiStore.cardHeight}px`,
                  width: ratio ? `${uiStore.cardHeight * ratio}px` : undefined,
                }}
              >
                <DiddlCardUi
                  imagePath={item.imagePath}
                  name={getItemName(item)}
                  class={cn(
                    "h-full w-full",

                    isGrayedOut() && "rounded ring-4 ring-black",
                  )}
                />
                <Show when={isDiffMode()}>
                  <div class="absolute top-1 right-1 z-10 flex gap-0.5">
                    <Show when={cardColors().length > 0}>
                      <For each={cardColors()}>
                        {(color) => (
                          <div
                            class="h-2.5 w-2.5 rounded-full"
                            style={{ "background-color": color }}
                          />
                        )}
                      </For>
                    </Show>
                  </div>
                </Show>
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
                      selectedIndices().includes(index()) && "from-transparent",
                    )}
                  >
                    <button
                      class={cn("absolute top-1.5 left-1.5 h-7 w-7 rounded-full")}
                      onClick={(e) => handleClick(index(), e)}
                    >
                      <Circle
                        class={cn(
                          "absolute inset-0 h-full w-full",
                          !selectedIndices().includes(index()) && isSelectMode() && "text-gray-200",
                        )}
                      />
                      <CheckCircle
                        class={cn(
                          "absolute inset-0 h-full w-full",
                          !isSelectMode() && "hover:text-white",
                          !selectedIndices().includes(index()) &&
                            isSelectMode() &&
                            "group-hover/card:text-white",
                          selectedIndices().includes(index()) &&
                            "rounded-full bg-blue-300 text-white",
                        )}
                      />
                    </button>
                  </div>
                  <Show when={isSelectMode()}>
                    <button
                      class={cn(
                        "absolute inset-0 h-full w-full rounded-t",
                        selectedIndices().includes(index()) && "border-[5px] border-blue-300",
                      )}
                      onClick={[handleClick, index()]}
                    />
                  </Show>
                </div>
                <Show when={isJoinedListItem(item)}>
                  <ListItemBadgesAndQuantity
                    item={item as JoinedListItem}
                    listId={listId()}
                    index={index()}
                    selectedIndices={selectedIndices()}
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

const handleClick = (index: number, event: MouseEvent) => {
  const selectedIndices = diddlStore.selectedIndices;
  if (event.shiftKey) {
    const lastClicked = selectedIndices.at(-1);
    if (lastClicked === undefined) return;

    const numbersBetween = getNumbersBetween(lastClicked, index);
    const isAdding = isAdd(selectedIndices, index);
    if (isAdding) {
      addSelectedIndices(numbersBetween);
      return;
    }
    if (!isAdding) {
      removeSelectedIndices(numbersBetween);
      return;
    }
  }

  const isAdding = !selectedIndices.includes(index);
  if (isAdding) {
    addSelectedIndices(index);
    return;
  }
  if (!isAdding) {
    removeSelectedIndices(index);
  }
};

const isAdd = (arr: number[], shiftClickIndex: number) => {
  const lastClicked = arr.at(-1);
  if (lastClicked === undefined) return;

  const numbersBetween = [lastClicked, ...getNumbersBetween(lastClicked, shiftClickIndex)];
  const numbersBetweenSet = new Set(numbersBetween);

  return !arrayHasAllSetElements(arr, numbersBetweenSet);
};

const arrayHasAllSetElements = <T,>(array: T[], set: Set<T>) => {
  const arraySet = new Set(array);
  return set.isSubsetOf(arraySet);
};

const getNumbersBetween = (a: number, b: number) => {
  const numbers: number[] = [];
  if (a < b) {
    for (let i = a + 1; i <= b; i++) numbers.push(i);
  }
  if (a > b) {
    for (let i = a - 1; i >= b; i--) numbers.push(i);
  }
  return numbers;
};

export default DiddlCards;
