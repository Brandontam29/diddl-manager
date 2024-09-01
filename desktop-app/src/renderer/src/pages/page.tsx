import { TbDownload } from 'solid-icons/tb';
import { RiMediaPlayListAddFill } from 'solid-icons/ri';
import DiddlCard from '@renderer/components/diddl-card';
import { addAcquiredItems, removeAcquiredItems } from '@renderer/features/acquired';
import { libraryStore, setLibraryStore } from '@renderer/features/library';
import {
  addSelectedIndices,
  removeSelectedIndices
} from '@renderer/features/library/selectedIndicesMethods';
import useScreenWidth from '@renderer/hooks/useScreenWidth';
import { cn } from '@renderer/libs/cn';
import { useSearchParams } from '@solidjs/router';
import { createEffect, createMemo, For, Show } from 'solid-js';
import { BsBookmarkDash, BsBookmarkPlus } from 'solid-icons/bs';

const HomePage = () => {
  const screenWidth = useScreenWidth();
  const [searchParams] = useSearchParams();

  const filteredDiddls = createMemo(() => {
    let diddls = libraryStore.libraryState;

    if (searchParams.type !== undefined) {
      diddls = diddls.filter((diddl) => searchParams.type === diddl.type);
    }

    if (searchParams.from || searchParams.to) {
      diddls = diddls.slice(
        searchParams.from !== undefined ? parseInt(searchParams.from) : 0,
        searchParams.to !== undefined ? parseInt(searchParams.to) : undefined
      );
    }

    return diddls;
  });

  createEffect(() => {
    // This will run whenever searchParams changes
    searchParams; // Access searchParams to create dependency

    // Reset your signal to a certain value
    setLibraryStore('selectedIndices', []);
  });

  const isSelectMode = createMemo(() => libraryStore.selectedIndices.length !== 0);

  return (
    <>
      <div
        class={cn('relative grow px-4 pt-10 pb-4 flex flex-wrap gap-1')}
        style={{ width: `${screenWidth() - 256 - 32}px` }}
      >
        <For each={filteredDiddls()} fallback={<div>...loading</div>}>
          {(diddl, index) => {
            const ratio =
              diddl.imageWidth && diddl.imageHeight ? diddl.imageWidth / diddl.imageHeight : null;
            return (
              <div
                class={cn('relative h-[240px] rounded overflow-hidden')}
                style={{ width: ratio ? `${240 * ratio}px` : undefined }}
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
      </div>
      <Show when={true}>
        <div
          class={cn(
            'fixed top-0 left-[256px] flex items-center gap-2',
            'bg-white py-1 px-1 rounded-b-md border-x border-b-2 shadow border-gray-300'
          )}
          style={{ width: `${screenWidth() - 256 - 32}px` }}
        >
          <button
            class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
            onClick={async () => setLibraryStore('selectedIndices', [])}
          >
            <span>X</span> <span>{libraryStore.selectedIndices.length} Selected</span>
          </button>
          <div class="h-[24px] w-px bg-gray-200" />
          <button
            class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
            onClick={async () => {
              await addAcquiredItems(
                libraryStore.selectedIndices.map((index) => filteredDiddls()[index]?.id || '')
              );
              setLibraryStore('selectedIndices', []);
            }}
          >
            <BsBookmarkPlus />
            <span>Add to Collection</span>
          </button>
          <div class="h-[24px] w-px bg-gray-200" />
          <button
            class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
            onClick={async () => {
              await removeAcquiredItems(
                libraryStore.selectedIndices.map((index) => filteredDiddls()[index]?.id || '')
              );
              setLibraryStore('selectedIndices', []);
            }}
          >
            <BsBookmarkDash />
            <span>Remove from Collection</span>
          </button>
          <div class="h-[24px] w-px bg-gray-200" />
          <button
            class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
            onClick={async () => {}}
          >
            <RiMediaPlayListAddFill />
            <span>Add To List</span>
          </button>
          <div class="h-[24px] w-px bg-gray-200" />
          <button
            class="gap-1 flex items-center px-2 py-1 rounded-md hover:bg-gray-200"
            onClick={async () => {}}
          >
            <TbDownload />
            <span>Download Images</span>
          </button>
        </div>
      </Show>
    </>
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

function arrayHasAllSetElements(array, set) {
  // Convert the array to a Set for faster lookups
  const arraySet = new Set(array);

  for (let item of set) {
    if (!arraySet.has(item)) {
      return false; // If any item in the Set is not found in the arraySet, return false
    }
  }
  return true; // All items in the Set are found in the arraySet
}

function getNumbersBetween(a: number, b: number) {
  //a is exclusive, b is inclusive
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

export default HomePage;

/**
 *  <div
              class={cn('relative h-[240px]')}
              style={{ width: ratio ? `${240 * ratio}px` : undefined }}
            >
              <DiddlCard className={cn('w-full h-full')} diddl={diddl} />

              <div
                class={cn(
                  'h-[calc(100%-20px)] w-full absolute top-0 inset-x',
                  libraryStore.selectedIndices.includes(index()) && 'border-4 border-blue-300',
                  'bg-gradient-to-t from-black/25 to-[48px]'
                )}
              >
                <div class="absolute top-0 inset-x bg-gradient-to-b from-black/25 w-full h-12">
                  <div class="top-1.5 left-1.5 h-8 w-8 rounded-full bg-gray-400" />
                </div>
                <div />
              </div>
            </div>
 */
