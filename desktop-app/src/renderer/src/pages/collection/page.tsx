import DiddlCard from '@renderer/components/diddl-card';
import { acquiredStore, removeAcquiredItems } from '@renderer/features/acquired';
import { libraryStore, setLibraryStore } from '@renderer/features/library';
import {
  addSelectedIndices,
  removeSelectedIndices
} from '@renderer/features/library/selectedIndicesMethods';
import BsCheckCircleFill from '@renderer/icons/BsCheckCircleFill';
import { cn } from '@renderer/libs/cn';
import { createEffect, createMemo, For, Show } from 'solid-js';

const CollectionPage = () => {
  const isSelectMode = createMemo(() => libraryStore.selectedIndices.length !== 0);

  const diddls = createMemo(() =>
    acquiredStore.acquiredItems
      .map((item) => {
        const index = libraryStore.libraryIndexMap[item.id];
        console.log(index);
        return libraryStore.libraryState[index];
      })
      .filter((item) => item !== undefined)
  );

  createEffect(() => console.log(diddls()));
  createEffect(() =>
    console.log('libraryStore.libraryIndexMap', Object.keys(libraryStore.libraryIndexMap))
  );

  return (
    <div class="relative grow px-4 pt-10 pb-4 gap-4">
      <Show when={isSelectMode()}>
        <div class="w-full absolute top-0 inset-x flex gap-4">
          <button
            onClick={async () => {
              await removeAcquiredItems(
                libraryStore.selectedIndices.map(
                  (index) => acquiredStore.acquiredItems[index]?.id || ''
                )
              );
              setLibraryStore('selectedIndices', []);
            }}
          >
            Set to Unowned
          </button>
          <button onClick={() => {}}>Add to Wishlist</button>
        </div>
      </Show>

      <Show when={Array.isArray(acquiredStore.acquiredItems)} fallback={<div>...loading</div>}>
        <Show
          when={acquiredStore.acquiredItems.length > 0}
          fallback={<div>No Diddl are marked as owned</div>}
        >
          <For each={diddls()}>
            {(diddl, index) => {
              const selected = libraryStore.selectedIndices.includes(index());
              return (
                <div class="relative group">
                  <DiddlCard diddl={diddl} />
                  <div
                    class={cn(
                      'w-full absolute inset-x top-0 h-8 bg-black/10 block invisible group-hover:visible',
                      isSelectMode() && 'visible'
                    )}
                  />

                  <button
                    class={cn(
                      'absolute top-0 right-0 h-8 w-8 flex invisible group-hover:visible border border-red-400 rounded-full items-center justify-center',
                      isSelectMode() && 'visible',
                      selected && 'bg-yellow-500'
                    )}
                    onClick={[handleClick, index()]}
                  >
                    <BsCheckCircleFill class={cn('text-green-400 h-6 w-6')} />
                  </button>
                </div>
              );
            }}
          </For>
        </Show>
      </Show>
    </div>
  );
};

const handleClick = (index: number, event: MouseEvent) => {
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
    }
  }

  addSelectedIndices(index);
  return;
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

export default CollectionPage;
