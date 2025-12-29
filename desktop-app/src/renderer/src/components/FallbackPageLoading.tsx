import { Image, ImageFallback, ImageRoot } from "@renderer/components/ui/image";
import diddlSad from "../assets/diddl-sad.gif";
import { Skeleton } from "@renderer/components/ui/skeleton";

const FallbackPageLoading = () => {
  return (
    <div class="max-w-lg mx-auto text-center space-y-2">
      <ImageRoot>
        <Image src={diddlSad} alt="Sad Diddl" />
        <ImageFallback>
          <Skeleton class="rounded h-[340px] aspect-square" />
        </ImageFallback>
      </ImageRoot>

      <h1 class="text-lg font-semibold">I am Loading!</h1>
      <p>I have large feet, but it doesn't mean I always get there fast. Patience is a virtue.</p>
    </div>
  );
};

export default FallbackPageLoading;
