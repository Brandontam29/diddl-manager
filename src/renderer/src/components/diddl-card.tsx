import { cn } from '@renderer/libs/cn';
import { LibraryEntry } from '@shared';

const DiddlCard = ({ diddl, className }: { diddl: LibraryEntry; className?: string }) => {
  return (
    <div class={cn(className)}>
      <img src={diddl.imagePath} loading="lazy" />
      <div>{diddl.name}</div>
    </div>
  );
};
export default DiddlCard;
