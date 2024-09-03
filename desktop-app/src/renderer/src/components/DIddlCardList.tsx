import { libraryStore, setLibraryStore } from '@renderer/features/library';
import { cn } from '@renderer/libs/cn';
import { LibraryEntry } from '@shared/library-models';
import { useSearchParams } from '@solidjs/router';
import { Component, createEffect, createMemo, For, Show } from 'solid-js';
import DiddlCard from './DiddlCard';
import FallbackLoading from './FallbackLoading';
import {
  addSelectedIndices,
  removeSelectedIndices
} from '@renderer/features/library/selectedIndicesMethods';
import { uiStore } from '@renderer/features/ui-state';
import FallbackNoDiddl from './FallbackNoDiddl';

const DiddlCardList: Component<{ diddls?: LibraryEntry[] }> = (props) => {
  const [searchParams] = useSearchParams();

  createEffect(() => {
    searchParams;
    setLibraryStore('selectedIndices', []);
  });

  const isSelectMode = createMemo(() => libraryStore.selectedIndices.length !== 0);

  return (
    <Show when={Array.isArray(props.diddls)} fallback={<FallbackLoading />}>
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
                class={cn('relative rounded overflow-hidden')}
                style={{
                  height: `${uiStore.cardHeight}px`,
                  width: ratio ? `${uiStore.cardHeight * ratio}px` : undefined
                }}
              >
                <DiddlCard className={cn('w-full h-full')} diddl={diddl} />

                <div // full overlay
                  class={cn(
                    'h-[calc(100%-20px)] w-full absolute top-0 inset-x',
                    libraryStore.selectedIndices.includes(index()) && 'border-4 border-blue-300',
                    isSelectMode() &&
                      'group hover:bg-gradient-to-t from-black/25 to-[48px] bg-gradient-to-t'
                  )}
                >
                  <div // top black
                    class={cn(
                      'absolute inset-0 bg-gradient-to-b from-black/25 to-[48px] w-full h-full opacity-0 hover:opacity-100',
                      isSelectMode() && 'opacity-100'
                    )}
                  >
                    <button // button
                      class={cn(
                        'absolute top-1.5 left-1.5 h-7 w-7 rounded-full bg-gray-400',
                        !isSelectMode() && 'hover:bg-gray-100',
                        isSelectMode() && 'group-hover:bg-gray-100',
                        libraryStore.selectedIndices.includes(index()) && 'bg-gray-100'
                      )}
                      onClick={[handleClick, index()]}
                    />
                  </div>
                  <Show // full card button
                    when={isSelectMode()}
                  >
                    <button
                      class={cn('absolute inset-0 w-full h-full')}
                      onClick={[handleClick, index()]}
                    />
                  </Show>
                </div>
              </div>
            );
          }}
        </For>
      </Show>
    </Show>
  );
};

const handleClick = (index: number, event: MouseEvent) => {
  console.log('click');
  if (event.shiftKey) {
    const lastClicked = libraryStore.selectedIndices[libraryStore.selectedIndices.length - 1];
    const numbersBetween = getNumbersBetween(lastClicked, index);
    const isAdding = isAdd(libraryStore.selectedIndices, index);
    if (isAdding) {
      addSelectedIndices(numbersBetween);
      return;
    }
    if (!isAdding) {
      removeSelectedIndices(numbersBetween);
      return;
    }
  }

  const isAdding = !libraryStore.selectedIndices.includes(index);
  console.log('isAdding', isAdding);
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

  for (let item of set) {
    if (!arraySet.has(item)) {
      return false;
    }
  }
  return true;
}

function getNumbersBetween(a: number, b: number) {
  let numbers: number[] = [];

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
