import { Image, ImageFallback, ImageRoot } from "@renderer/components/ui/image";
import { Skeleton } from "@renderer/components/ui/skeleton";

import diddlSad from "../../assets/diddl-sad.gif";

const FallbackNoList = () => {
  return (
    <div class="mx-auto max-w-lg space-y-2 text-center">
      <ImageRoot>
        <Image src={diddlSad} alt="Sad Diddl" loading="eager" />
        <ImageFallback>
          <Skeleton class="aspect-square h-[340px] rounded" />
        </ImageFallback>
      </ImageRoot>

      <h1 class="text-lg font-semibold">List is empty!</h1>
      <p>
        You can create one by pressing the button above. Then select Diddls in the categories and
        press Add to List on the top bar.
      </p>
    </div>
  );
};

export default FallbackNoList;
