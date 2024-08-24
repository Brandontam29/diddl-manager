import { LibraryEntry } from '@shared';

const DiddlCard = ({ diddl }: { diddl: LibraryEntry }) => {
  return (
    <div>
      Content over background image
      <img src={'../../../resources/diddl-images/001_RARETES/BPFische.jpg'} loading="lazy" />
      <div>{diddl.name}</div>
    </div>
  );
};

export default DiddlCard;
