import diddlTongue from "@renderer/assets/diddl-tongue.gif";
import { Image, ImageFallback, ImageRoot } from "@renderer/components/ui/image";
import { Skeleton } from "@renderer/components/ui/skeleton";

const NotFoundPage = () => {
  return (
    <div class="mx-auto max-w-lg space-y-2 text-center">
      <ImageRoot>
        <Image src={diddlTongue} alt="Diddl sticking his tongue out laughing" />
        <ImageFallback>
          <Skeleton class="aspect-square h-[390px] rounded" />
        </ImageFallback>
      </ImageRoot>

      <h1 class="text-lg font-semibold">This Page is Not Found</h1>
      <p>You can click on Home to go back to an existing page.</p>
    </div>
  );
};

export default NotFoundPage;
