import DiddlCard from '@renderer/components/diddl-card';
import { libraryStore } from '@renderer/features/library';
import { For } from 'solid-js';

const HomePage = () => {
  return (
    <div class="p-4 grid grid-cols-4">
      <For each={libraryStore.libraryState} fallback={<div>Loading...</div>}>
        {(diddl) => <DiddlCard diddl={diddl} />}
      </For>
    </div>
  );
};

export default HomePage;
