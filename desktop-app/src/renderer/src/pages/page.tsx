import { libraryStore } from '@renderer/features/library';
import useScreenWidth from '@renderer/hooks/useScreenWidth';
import { cn } from '@renderer/libs/cn';
import { useSearchParams } from '@solidjs/router';
import { createMemo, Show } from 'solid-js';
import DiddlCardList from '@renderer/components/DIddlCardList';
import TaskbarLibrary from './components/TaskbarLibrary';

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
        <TaskbarLibrary diddls={filteredDiddls()} />
      </Show>
    </>
  );
};

export default HomePage;
