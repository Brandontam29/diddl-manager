import { cn } from '@renderer/libs/cn';
import type { LibraryEntry } from '@shared';
import type { Component } from 'solid-js';

const DiddlCard: Component<{ diddl: LibraryEntry; className?: string }> = (props) => {
  return (
    <div class={cn(props.className)}>
      <div
        class="h-[calc(100%-20px)] w-full border-2 border-black bg-cover rounded-t"
        style={{ 'background-image': `url(${props.diddl.imagePath})` }}
      />
      <div class="bg-green-400 h-5 w-full grid place-content-center">{props.diddl.name}</div>
    </div>
  );
};
export default DiddlCard;
