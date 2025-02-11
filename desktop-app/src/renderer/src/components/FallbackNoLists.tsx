import { Image, ImageFallback, ImageRoot } from "@renderer/components/ui/image";
import diddlSad from "../assets/diddl-sad.gif";
import { Skeleton } from "@renderer/components/ui/skeleton";

const FallbackNoList = () => {
  return (
    <div class="max-w-lg mx-auto text-center space-y-2">
      <ImageRoot>
        <Image src={diddlSad} />
        <ImageFallback>
          <Skeleton class="rounded h-[340px] aspect-square" />
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
