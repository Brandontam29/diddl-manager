import { libraryStore, setLibraryStore } from '@renderer/features/library';

import { createEffect, createMemo, Show } from 'solid-js';
import { BsBookmarkDash } from 'solid-icons/bs';
import DiddlCardList from '@renderer/components/DIddlCardList';
import { fetchListItems, listStore } from '@renderer/features/lists';
import { useParams } from '@solidjs/router';

import useScreenWidth from '@renderer/hooks/useScreenWidth';
import { cn } from '@renderer/libs/cn';
import { removeListItems } from '@renderer/features/lists/listMethods';
import { ListItem } from '@shared/index';

const ListIdPage = () => {
  const screenWidth = useScreenWidth();

  const params = useParams();
  const isSelectMode = createMemo(() => libraryStore.selectedIndices.length !== 0);

  const diddls = createMemo(() => {
    if (!listStore.listItems) return listStore.listItems;

    const entries = listStore.listItems.map((item) => {
      const index = libraryStore.libraryIndexMap[item.id];
      return libraryStore.libraryState[index];
    });

    return entries;
  });

  createEffect(() => {
    fetchListItems(params.id);
  });

  return (
    <>
      <div
        class={cn('relative grow px-4 pt-10 pb-4 flex flex-wrap gap-2')}
        style={{ width: `${screenWidth() - 256 - 32}px` }}
      >
        <DiddlCardList diddls={diddls()} />
      </div>
      <Show when={isSelectMode()}>
        <div class="w-full absolute top-0 inset-x flex gap-4">
          <button onClick={() => onRemoveFromList(params.id, listStore.listItems)}>
            <BsBookmarkDash />
            Remove
          </button>
        </div>
      </Show>
    </>
  );
};

const onRemoveFromList = async (id: string, listItems?: ListItem[]) => {
  if (!listItems) return;

  await removeListItems(
    id,
    libraryStore.selectedIndices.map((n) => listItems[n].id)
  );
  setLibraryStore('selectedIndices', []);
};

export default ListIdPage;
