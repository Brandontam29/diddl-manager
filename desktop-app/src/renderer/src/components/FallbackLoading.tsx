import { For } from 'solid-js';
import { Skeleton } from './ui/skeleton';
import { uiStore } from '@renderer/features/ui-state';

const LIST = new Array(10);
const FallbackLoading = () => {
  return (
    <div class="flex flex-wrap">
      <For each={LIST}>
        {() => (
          <Skeleton
            class="aspect-video"
            style={{
              height: `${uiStore.cardHeight}px`
            }}
          />
        )}
      </For>
    </div>
  );
};

export default FallbackLoading;
