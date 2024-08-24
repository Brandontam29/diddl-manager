import { LibraryEntry } from '@shared';

const DiddlCard = ({ diddl }: { diddl: LibraryEntry }) => {
  return (
    <div>
      Content over background image
      <img src={diddl.imagePath} loading="lazy" />
      <div>{diddl.name}</div>
    </div>
  );
};

export default DiddlCard;
