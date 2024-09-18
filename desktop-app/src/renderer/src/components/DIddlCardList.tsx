import { libraryStore, setLibraryStore } from "@renderer/features/library";
import { cn } from "@renderer/libs/cn";
import type { LibraryEntry } from "@shared/library-models";
import { useParams, useSearchParams } from "@solidjs/router";
import { type Component, createEffect, createMemo, For, JSX, Show } from "solid-js";
import DiddlCard from "./DiddlCard";
import {
  addSelectedIndices,
  removeSelectedIndices,
} from "@renderer/features/library/selectedIndicesMethods";
import { uiStore } from "@renderer/features/ui-state";
import FallbackNoDiddl from "./FallbackNoDiddl";
import FallbackLoadingDiddl from "./FallbackLoadingDiddl";
import { ListItem } from "@shared/item-models";
import { CircleX, Minus, Plus, X } from "lucide-solid";
import { Button } from "./ui/button";
import { updateListItems } from "@renderer/features/lists/listMethods";

const DiddlCardList: Component<{
  diddls?: (LibraryEntry & Partial<ListItem>)[];
  isListItem?: boolean;
}> = (props) => {
  const params = useParams();

  const selectedIndices = () => libraryStore.selectedIndices;
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
                    selectedIndices().includes(index()) && "border-4 border-blue-300",
                    isSelectMode() &&
                      "group hover:bg-gradient-to-t from-black/25 to-[48px] bg-gradient-to-t",
                  )}
                >
                  <div // top black
                    class={cn(
                      "absolute inset-0 bg-gradient-to-b from-black/25 w-full h-[48px] opacity-0 hover:opacity-100",
                      isSelectMode() && "opacity-100",
                    )}
                  >
                    <button // button
                      class={cn(
                        "absolute top-1.5 left-1.5 h-7 w-7 rounded-full bg-gray-400",
                        !isSelectMode() && "hover:bg-gray-100",
                        isSelectMode() && "group-hover:bg-gray-100",
                        selectedIndices().includes(index()) && "bg-gray-100",
                      )}
                      onClick={(e) => handleClick(index(), e)}
                    />
                  </div>
                  <Show // full card button
                    when={isSelectMode()}
                  >
                    <button
                      class={cn("absolute inset-0 w-full h-full")}
                      onClick={[handleClick, index()]}
                    />
                  </Show>
                </div>

                <Show when={props.isListItem}>
                  <div class="absolute bottom-5 -left-1 space-y-px">
                    <Show when={diddl?.isDamaged}>
                      <Badge
                        dotColor="bg-red-400"
                        onClick={() => {
                          if (isSelectMode()) {
                            if (!selectedIndices().includes(index())) addSelectedIndices(index());

                            updateListItems(
                              params.id,
                              selectedIndices().map((i) => props.diddls![i].id),
                              { isDamaged: false },
                            );
                            return;
                          }

                          updateListItems(params.id, [diddl.id], { isDamaged: false });
                        }}
                      >
                        Damaged
                      </Badge>
                    </Show>
                    <Show when={diddl?.isIncomplete}>
                      <Badge
                        dotColor="bg-yellow-400"
                        onClick={() => {
                          if (isSelectMode()) {
                            if (!selectedIndices().includes(index())) addSelectedIndices(index());

                            updateListItems(
                              params.id,
                              selectedIndices().map((i) => props.diddls![i].id),
                              { isIncomplete: false },
                            );
                            return;
                          }

                          updateListItems(params.id, [diddl.id], { isIncomplete: false });
                        }}
                      >
                        Incomplete
                      </Badge>
                    </Show>
                    <Show when={diddl?.count}>
                      <div class="w-min flex items-center rounded border border-gray-300 bg-gray-50 divide-x">
                        <Button
                          variant="none"
                          size="none"
                          class="hover:bg-pink-200 h-5"
                          onClick={() => {
                            if (isSelectMode()) {
                              if (!selectedIndices().includes(index())) addSelectedIndices(index());

                              updateListItems(
                                params.id,
                                selectedIndices().map((i) => props.diddls![i].id),
                                { addCount: -1 },
                              );
                              return;
                            }

                            updateListItems(params.id, [diddl.id], { addCount: -1 });
                          }}
                        >
                          <Minus size={15} />
                        </Button>
                        <div class="w-8 px-1 text-sm">{diddl.count}</div>
                        <Button
                          variant="none"
                          size="none"
                          class="hover:bg-pink-200 h-5"
                          onClick={() => {
                            if (isSelectMode()) {
                              if (!selectedIndices().includes(index())) addSelectedIndices(index());
                              updateListItems(
                                params.id,
                                selectedIndices().map((i) => props.diddls![i].id),
                                { addCount: 1 },
                              );
                              return;
                            }

                            updateListItems(params.id, [diddl.id], { addCount: 1 });
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
      props.onClick && "cursor-pointer group",
    )}
    onClick={props.onClick}
  >
    <Show when={props.dotColor}>
      <div
        class={cn(
          "rounded-full h-2 aspect-square border border-gray-300",
          props.onClick && "group-hover:hidden",
          props.dotColor,
        )}
      />
      <CircleX
        size={8}
        class={cn("h-2 aspect-square hidden", props.onClick && "group-hover:block")}
      />
    </Show>
    <div class="text-sm">{props.children}</div>
  </Button>
);

const handleClick = (index: number, event: MouseEvent) => {
  const selectedIndices = libraryStore.selectedIndices;
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

function arrayHasAllSetElements(array: any[], set: Set<any>) {
  const arraySet = new Set(array);

  for (const item of set) {
    if (!arraySet.has(item)) {
      return false;
    }
  }
  return true;
}

function getNumbersBetween(a: number, b: number) {
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
}

export default DiddlCardList;
