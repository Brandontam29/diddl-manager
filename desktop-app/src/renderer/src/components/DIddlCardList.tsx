import { libraryStore, setLibraryStore } from "@renderer/features/library";
import { cn } from "@renderer/libs/cn";
import type { LibraryEntry } from "@shared/library-models";
import { useSearchParams } from "@solidjs/router";
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
import { Minus, Plus } from "lucide-solid";
import { Button } from "./ui/button";

const DiddlCardList: Component<{
  diddls?: (LibraryEntry & Partial<ListItem>)[];
  isListItem?: boolean;
}> = (props) => {
  const [searchParams] = useSearchParams();

  createEffect(() => {
    searchParams;
    setLibraryStore("selectedIndices", []);
  });

  const selectedIndices = () => libraryStore.selectedIndices;
  const isSelectMode = createMemo(() => selectedIndices().length !== 0);

  createEffect(() => console.log(selectedIndices()));
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
                class={cn("relative rounded overflow-hidden")}
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
                  <div class="absolute bottom-0 left-0 flex flex-col">
                    <Show when={diddl?.isDamaged}>
                      <Badge dotColor="bg-red-400">Damaged</Badge>
                    </Show>
                    <Show when={diddl?.isIncomplete}>
                      <Badge dotColor="bg-yellow-400">Incomplete</Badge>
                    </Show>
                    <Show when={diddl?.count}>
                      <Badge>
                        <div>{diddl.count}</div>
                        <div>
                          <Button variant="none">
                            <Plus />
                          </Button>
                          <Button variant="none">
                            <Minus />
                          </Button>
                        </div>
                      </Badge>
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

const Badge: Component<{ dotColor?: string; children: JSX.Element }> = (props) => (
  <div class="flex items-center gap-1 p-px rounded border border-gray-300">
    <Show when={props.dotColor}>
      <div class={cn("rounded-full", props.dotColor)} />
    </Show>
    <div class="text-sm">{props.children}</div>
  </div>
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
  console.log("isAdding", isAdding);
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
