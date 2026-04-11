import { Image, ImageFallback, ImageRoot } from "@renderer/components/ui/image";
import { Skeleton } from "@renderer/components/ui/skeleton";

import diddlSad from "../../assets/diddl-sad.gif";

const FallbackNoDiddl = () => {
  return (
    <div class="mx-auto max-w-lg space-y-2 text-center">
      <ImageRoot>
        <Image src={diddlSad} alt="Sad Diddl" loading="eager" />
        <ImageFallback>
          <Skeleton class="aspect-square h-[340px] rounded" />
        </ImageFallback>
      </ImageRoot>

      <h1 class="text-lg font-semibold">List is empty!</h1>
      <p>You can add some by clicking on the top left corner of Diddl, then click "Add to List"</p>
    </div>
  );
};

export default FallbackNoDiddl;
