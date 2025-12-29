import { diddlStore } from "@renderer/features/diddl";
import { cn } from "@renderer/libs/cn";
import type { Diddl } from "@shared";
import { useParams } from "@solidjs/router";
import { type Component, createMemo, For, JSX, Show } from "solid-js";
import DiddlCard from "./DiddlCard";
import {
  addSelectedIndices,
  removeSelectedIndices,
} from "@renderer/features/diddl/selectedIndicesMethods";
import { uiStore } from "@renderer/features/ui-state";
import FallbackNoDiddl from "./FallbackNoDiddl";
import FallbackLoadingDiddl from "./FallbackLoadingDiddl";
import { ListItem } from "@shared";
import { CheckCircle, Circle, CircleX, Minus, Plus } from "lucide-solid";
import { Button } from "./ui/button";
import { updateListItems } from "@renderer/features/lists/listMethods";

const DiddlListCard: Component<{
  diddls?: (Diddl & { listItem?: ListItem })[];
  isListItem?: boolean;
}> = (props) => {
  const params = useParams();
  const isListItem = createMemo(() => props?.diddls?.[0]?.hasOwnProperty("listItem") || false);
  const listId = createMemo(() => parseInt(params.id));
  const selectedIndices = () => diddlStore.selectedIndices;
  const isSelectMode = createMemo(() => selectedIndices().length !== 0);

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
                <DiddlCard className={cn("w-full h-full")} diddl={diddl} />

                <div // full overlay
                  class={cn(
                    "h-[calc(100%-20px)] w-full absolute top-0 inset-x",

                    isSelectMode() &&
                      "group/card hover:bg-linear-to-t hover:from-black/25 hover:to-[48px]",
                  )}
                >
                  <div // top black
                    class={cn(
                      "absolute inset-0 bg-linear-to-b from-black/35 w-full h-12 opacity-0 hover:opacity-100 text-transparent", //default no show button
                      !isSelectMode() && "hover:text-gray-200", // if non-select mode, hover shows gray check
                      isSelectMode() && "opacity-100", //show black top overlay in select mode
                      selectedIndices().includes(index()) && "from-transparent", // do not show if selected
                    )}
                  >
                    <button // button
                      class={cn("absolute top-1.5 left-1.5 h-7 w-7 rounded-full")}
                      onClick={(e) => handleClick(index(), e)}
                    >
                      <Circle
                        class={cn(
                          "absolute inset-0 w-full h-full",
                          !selectedIndices().includes(index()) && isSelectMode() && "text-gray-200", // in select mode, show empty gray circle
                        )}
                      />
                      <CheckCircle
                        class={cn(
                          "absolute inset-0 w-full h-full",
                          !isSelectMode() && "hover:text-white", // if non-select mode, top hover is gray, then direct hover is white

                          !selectedIndices().includes(index()) &&
                            isSelectMode() &&
                            "group-hover/card:text-white", // if select mode, hover shows white check

                          selectedIndices().includes(index()) &&
                            "rounded-full bg-blue-300 text-white", // if selected, become blue
                        )}
                      />
                    </button>
                  </div>
                  <Show // full card button
                    when={isSelectMode()}
                  >
                    <button
                      class={cn(
                        "absolute inset-0 w-full h-full rounded-t",
                        selectedIndices().includes(index()) && "border-[5px] border-blue-300",
                      )}
                      onClick={[handleClick, index()]}
                    />
                  </Show>
                </div>

                <Show when={isListItem()}>
                  <div class="absolute bottom-5 -left-1 space-y-px">
                    <Show when={diddl?.listItem?.isDamaged}>
                      <Badge dotColor="bg-red-400">Damaged</Badge>
                    </Show>
                    <Show when={diddl?.listItem?.isIncomplete}>
                      <Badge dotColor="bg-yellow-400">Incomplete</Badge>
                    </Show>
                    <Show when={diddl?.listItem?.quantity}>
                      <div class="w-min flex items-center rounded border border-gray-300 bg-gray-50 divide-x">
                        <Button
                          variant="none"
                          size="none"
                          class="hover:bg-pink-200 h-5"
                          onClick={() => {
                            if (!diddl?.listItem) return;

                            if (!isSelectMode()) {
                              updateListItems(listId(), [diddl.listItem.id], { addQuantity: -1 });
                              return;
                            }

                            if (!selectedIndices().includes(index())) addSelectedIndices(index());

                            updateListItems(
                              listId(),
                              selectedIndices().map((i) => props.diddls![i]?.listItem?.id || -1),
                              { addQuantity: -1 },
                            );
                          }}
                        >
                          <Minus size={15} />
                        </Button>
                        <div class="w-8 px-1 text-sm">{diddl?.listItem?.quantity}</div>
                        <Button
                          variant="none"
                          size="none"
                          class="hover:bg-pink-200 h-5"
                          onClick={() => {
                            if (!diddl?.listItem) return;

                            if (!isSelectMode()) {
                              updateListItems(listId(), [diddl.listItem.id], { addQuantity: 1 });
                              return;
                            }

                            if (!selectedIndices().includes(index())) addSelectedIndices(index());

                            updateListItems(
                              listId(),
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
      "w-min flex items-center gap-px p-px rounded border border-gray-300 bg-gray-50 cursor-default",
      props.onClick && "cursor-pointer group/card",
    )}
    onClick={props.onClick}
  >
    <Show when={props.dotColor}>
      <div
        class={cn(
          "rounded-full h-2 aspect-square border border-gray-300",
          props.onClick && "group/card-hover:hidden",
          props.dotColor,
        )}
      />
      <CircleX
        size={8}
        class={cn("h-2 aspect-square hidden", props.onClick && "group/card-hover:block")}
      />
    </Show>
    <div class="text-sm">{props.children}</div>
  </Button>
);

const handleClick = (index: number, event: MouseEvent) => {
  const selectedIndices = diddlStore.selectedIndices;
  if (event.shiftKey) {
    const lastClicked = selectedIndices[selectedIndices.length - 1];
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
    return;
  }
};

const isAdd = (arr: number[], shiftClickIndex: number) => {
  const lastClicked = arr[arr.length - 1];

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
