import { cn } from '@renderer/libs/cn';
import { LibraryEntry } from '@shared';

const DiddlCard = ({ diddl, className }: { diddl: LibraryEntry; className?: string }) => {
  return (
    <div class={cn(className)}>
      <div
        class="h-[calc(100%-20px)] w-full border-2 border-black bg-cover"
        style={{ 'background-image': `url(${diddl.imagePath})` }}
      />
      <div class="bg-green-400 h-5 w-full grid place-content-center">{diddl.name}</div>
    </div>
  );
};
export default DiddlCard;
