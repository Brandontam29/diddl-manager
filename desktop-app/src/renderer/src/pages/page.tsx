import { HiOutlineXCircle } from 'solid-icons/hi';
import { TbDownload } from 'solid-icons/tb';
import { RiMediaPlayListAddFill } from 'solid-icons/ri';
import { addAcquiredItems, removeAcquiredItems } from '@renderer/features/acquired';
import { libraryStore, setLibraryStore } from '@renderer/features/library';
import useScreenWidth from '@renderer/hooks/useScreenWidth';
import { cn } from '@renderer/libs/cn';
import { useSearchParams } from '@solidjs/router';
import { createMemo, Show } from 'solid-js';
import { BsBookmarkDash, BsBookmarkPlus } from 'solid-icons/bs';
import DiddlCardList from '@renderer/components/DIddlCardList';

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

  return (
    <>
      <div
        class={cn('relative grow px-4 pt-10 pb-4 flex flex-wrap gap-2')}
        style={{ width: `${screenWidth() - 256 - 32}px` }}
      >
        <DiddlCardList diddls={filteredDiddls()} />
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
            <HiOutlineXCircle /> <span>{libraryStore.selectedIndices.length} Selected</span>
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

export default HomePage;
