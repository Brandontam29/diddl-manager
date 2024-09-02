import { Image, ImageFallback, ImageRoot } from '@renderer/components/ui/image';
import diddlTongue from '../../assets/diddl-tongue.gif';
import { Skeleton } from '@renderer/components/ui/skeleton';

const NotFoundPage = () => {
  return (
    <div class="max-w-lg mx-auto text-center space-y-2">
      <ImageRoot>
        <Image src={diddlTongue} />
        <ImageFallback>
          <Skeleton class="rounded h-[390px] aspect-square" />
        </ImageFallback>
      </ImageRoot>

      <h1 class="text-lg font-semibold">This Page is Not Found</h1>
      <p>You can click on Home to go back to an existing page.</p>
    </div>
  );
};

export default NotFoundPage;
