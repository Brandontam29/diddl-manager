import { For } from 'solid-js';
import { Skeleton } from './ui/skeleton';
import { uiStore } from '@renderer/features/ui-state';

const LIST = new Array(30);
const FallbackLoadingDiddl = () => {
  return (
    <div class="flex flex-wrap gap-2 content-start">
      <For each={LIST}>
        {() => (
          <Skeleton
            class="aspect-[6/5]"
            style={{
              height: `${uiStore.cardHeight}px`
            }}
          />
        )}
      </For>
    </div>
  );
};

export default FallbackLoadingDiddl;
