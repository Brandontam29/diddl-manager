import { useAction, useParams } from "@solidjs/router";
import { CheckCircle, Circle, CircleX, Minus, Plus } from "lucide-solid";
import { type Component, For, JSX, Show, createEffect, createMemo } from "solid-js";

import type { Diddl } from "@shared";
import { ListItem } from "@shared";

import FallbackLoadingDiddl from "@renderer/components/fallback/FallbackLoadingDiddl";
import FallbackNoDiddl from "@renderer/components/fallback/FallbackNoDiddl";
import { Button } from "@renderer/components/ui/button";
import { diddlStore, setDiddlStore } from "@renderer/features/diddl";
import {
  addSelectedIndices,
  removeSelectedIndices,
} from "@renderer/features/diddl/selectedIndicesMethods";
import { updateListItemsAction } from "@renderer/features/lists";
import { uiStore } from "@renderer/features/ui-state";
import { cn } from "@renderer/libs/cn";

import DiddlCard from "./DiddlCard";

const DiddlListCard: Component<{
  diddls?: (Diddl & { listItem?: ListItem })[];
  isListItem?: boolean;
}> = (props) => {
  const params = useParams();
  const listId = createMemo(() => (params.id === undefined ? null : parseInt(params.id)));
  const selectedIndices = () => diddlStore.selectedIndices;
  const isSelectMode = createMemo(() => selectedIndices().length > 0);
  const updateListItems = useAction(updateListItemsAction);

  createEffect(() => console.log(props.diddls));
  return (
    <Show when={Array.isArray(props.diddls)} fallback={<FallbackLoadingDiddl />}>
      <Show
        when={Array.isArray(props.diddls) && props.diddls.length > 0}
        fallback={<FallbackNoDiddl />}
      >
        <For each={props.diddls}>
          {(diddl, index) => {
            const ratio =
              diddl.imageWidth && diddl.imageHeight ? diddl.imageWidth / diddl.imageHeight : null;

            return (
              <div
                class={cn("relative rounded")}
                style={{
                  height: `${uiStore.cardHeight}px`,
                  width: ratio ? `${uiStore.cardHeight * ratio}px` : undefined,
                }}
              >
                <DiddlCard className={cn("h-full w-full")} diddl={diddl} />
                <div
                  // full overlay
                  class={cn(
                    "inset-x absolute top-0 h-[calc(100%-20px)] w-full",

                    isSelectMode() &&
                      "group/card hover:bg-linear-to-t hover:from-black/25 hover:to-[48px]",
                  )}
                >
                  <div
                    // top black
                    class={cn(
                      // default no show button
                      "absolute inset-0 h-12 w-full bg-linear-to-b from-black/35 text-transparent opacity-0 hover:opacity-100",
                      // if non-select mode, hover shows gray check
                      !isSelectMode() && "hover:text-gray-200",
                      // show black top overlay in select mode
                      isSelectMode() && "opacity-100",
                      // do not show if selected
                      selectedIndices().includes(index()) && "from-transparent",
                    )}
                  >
                    <button
                      // button
                      class={cn("absolute top-1.5 left-1.5 h-7 w-7 rounded-full")}
                      onClick={(e) => handleClick(index(), e)}
                    >
                      <Circle
                        class={cn(
                          "absolute inset-0 h-full w-full",
                          // in select mode, show empty gray circle
                          !selectedIndices().includes(index()) && isSelectMode() && "text-gray-200",
                        )}
                      />
                      <CheckCircle
                        class={cn(
                          // if non-select mode, top hover is gray, then direct hover is white

                          "absolute inset-0 h-full w-full",
                          !isSelectMode() && "hover:text-white",

                          !selectedIndices().includes(index()) &&
                            // if select mode, hover shows white check

                            isSelectMode() &&
                            "group-hover/card:text-white",

                          // if selected, become blue

                          selectedIndices().includes(index()) &&
                            "rounded-full bg-blue-300 text-white",
                        )}
                      />
                    </button>
                  </div>
                  <Show
                    // full card button
                    when={isSelectMode()}
                  >
                    <button
                      class={cn(
                        "absolute inset-0 h-full w-full rounded-t",
                        selectedIndices().includes(index()) && "border-[5px] border-blue-300",
                      )}
                      onClick={[handleClick, index()]}
                    />
                  </Show>
                </div>
                <Show when={props.isListItem}>
                  <div class="absolute bottom-5 -left-1 space-y-px">
                    <Show when={diddl?.listItem?.isDamaged}>
                      <Badge dotColor="bg-red-400">Damaged</Badge>
                    </Show>
                    <Show when={diddl?.listItem?.isIncomplete}>
                      <Badge dotColor="bg-yellow-400">Incomplete</Badge>
                    </Show>
                    <Show when={diddl?.listItem?.quantity}>
                      <div class="flex w-min items-center divide-x rounded border border-gray-300 bg-gray-50">
                        <Button
                          variant="none"
                          size="none"
                          class="h-5 hover:bg-pink-200"
                          onClick={async () => {
                            if (!diddl?.listItem) return;
                            const localListId = listId();

                            if (localListId === null) return;

                            if (!isSelectMode()) {
                              updateListItems(localListId, [diddl.listItem.id], {
                                addQuantity: -1,
                              });
                              return;
                            }

                            if (!selectedIndices().includes(index())) addSelectedIndices(index());

                            const result = await updateListItems(
                              localListId,
                              selectedIndices().map((i) => props.diddls![i]?.listItem?.id || -1),
                              { addQuantity: -1 },
                            );

                            console.log(result);
                            if (result?.data?.numDeletedRows) setDiddlStore("selectedIndices", []);
                          }}
                        >
                          <Minus size={15} />
                        </Button>
                        <div class="w-8 px-1 text-sm">{diddl?.listItem?.quantity}</div>
                        <Button
                          variant="none"
                          size="none"
                          class="h-5 hover:bg-pink-200"
                          onClick={() => {
                            if (!diddl?.listItem) return;
                            const localListId = listId();

                            if (localListId === null) return;

                            if (!isSelectMode()) {
                              updateListItems(localListId, [diddl.listItem.id], { addQuantity: 1 });
                              return;
                            }

                            if (!selectedIndices().includes(index())) addSelectedIndices(index());

                            updateListItems(
                              localListId,
                              selectedIndices().map((i) => props.diddls![i]?.listItem?.id || -1),
                              { addQuantity: 1 },
                            );
                          }}
                        >
                          <Plus size={15} />
                        </Button>
                      </div>
                    </Show>
                  </div>
                </Show>
              </div>
            );
          }}
        </For>
      </Show>
    </Show>
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
    for (let i = a + 1; i <= b; i++) {
      numbers.push(i);
    }
  }

  if (a > b) {
    for (let i = a - 1; i >= b; i--) {
      numbers.push(i);
    }
  }

  return numbers;
};

export default DiddlListCard;
