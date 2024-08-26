import DiddlCard from '@renderer/components/diddl-card';
import { addAcquiredItems, removeAcquiredItems } from '@renderer/features/acquired';
import { libraryStore } from '@renderer/features/library';
import { setLibraryStore } from '@renderer/features/library/createLibraryStore';
import {
  addSelectedIndices,
  removeSelectedIndices
} from '@renderer/features/library/selectedIndicesMethods';
import BsCheckCircleFill from '@renderer/icons/BsCheckCircleFill';
import { cn } from '@renderer/libs/cn';
import { useSearchParams } from '@solidjs/router';
import { createEffect, createMemo, For, Show } from 'solid-js';

const HomePage = () => {
  const [searchParams] = useSearchParams();

  const filteredDiddls = createMemo(() => {
    let diddls = libraryStore.libraryState;

    if (searchParams.type !== undefined || searchParams.owned !== undefined) {
      diddls = diddls.filter((diddl) => {
        return searchParams.type !== undefined
          ? searchParams.owned !== undefined
            ? searchParams.type === diddl.type && searchParams.owned === `${diddl.owned}` // has type and has owned
            : searchParams.type === diddl.type // has type and not owned
          : searchParams.owned !== undefined
            ? searchParams.owned === `${diddl.owned}` // not type and has owned
            : false; // not type and not owned => impossible
      });
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
    <div class="grow p-4 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
      <Show when={isSelectMode()}>
        <div class="flex gap-4">
          <button
            onClick={() => {
              addAcquiredItems(
                libraryStore.selectedIndices.map((index) => filteredDiddls[index]?.id || '')
              );
            }}
          >
            Set to Owned
          </button>
          <button
            onClick={() => {
              removeAcquiredItems(
                libraryStore.selectedIndices.map((index) => filteredDiddls[index]?.id || '')
              );
            }}
          >
            Set to Unowned
          </button>
          <button onClick={() => {}}>Add to Wishlist</button>
        </div>
      </Show>

      <Show when={Array.isArray(filteredDiddls())} fallback={<div>...loading</div>}>
        <Show when={filteredDiddls().length > 0} fallback={<div>No Diddl are marked as owned</div>}>
          <For each={filteredDiddls()}>
            {(diddl, index) => (
              <div class="relative group">
                <DiddlCard diddl={diddl} />
                <button
                  class={cn(
                    'absolute top-0 right-0 h-4 w-4 hidden group-hover:block',
                    isSelectMode() && 'block'
                  )}
                  onClick={[handleClick, index]}
                >
                  <BsCheckCircleFill />
                </button>
              </div>
            )}
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

export default HomePage;
