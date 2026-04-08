import { Image, ImageFallback, ImageRoot } from "@renderer/components/ui/image";
import { Skeleton } from "@renderer/components/ui/skeleton";

import diddlSad from "../../assets/diddl-sad.gif";

const FallbackPageLoading = () => {
  return (
    <div class="mx-auto max-w-lg space-y-2 text-center">
      <ImageRoot>
        <Image src={diddlSad} alt="Sad Diddl" />
        <ImageFallback>
          <Skeleton class="aspect-square h-[340px] rounded" />
        </ImageFallback>
      </ImageRoot>

      <h1 class="text-lg font-semibold">I am Loading!</h1>
      <p>I have large feet, but it doesn't mean I always get there fast. Patience is a virtue.</p>
    </div>
  );
};

export default FallbackPageLoading;
