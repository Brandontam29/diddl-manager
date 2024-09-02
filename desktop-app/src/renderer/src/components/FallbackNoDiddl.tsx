import { Image, ImageFallback, ImageRoot } from '@renderer/components/ui/image';
import diddlSad from '../../assets/diddl-sad.gif';
import { Skeleton } from '@renderer/components/ui/skeleton';
const FallbackNoDiddl = () => {
  return (
    <div class="max-w-lg mx-auto text-center space-y-2">
      <ImageRoot>
        <Image src={diddlSad} />
        <ImageFallback>
          <Skeleton class="rounded h-[340px] aspect-square" />
        </ImageFallback>
      </ImageRoot>

      <h1 class="text-lg font-semibold">Collection is empty!</h1>
      <p>
        You can add some by clicking on the top left corner of Diddl, then click "Add to Collection"
      </p>
    </div>
  );
};

export default FallbackNoDiddl;
