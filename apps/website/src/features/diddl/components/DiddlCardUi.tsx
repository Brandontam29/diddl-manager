import { ImageOffIcon } from "lucide-solid";
import { type Component } from "solid-js";

import { Image, ImageFallback, ImageRoot } from "@/components/ui/image";
import { cn } from "@/libs/cn";
import { imageUrl } from "@/libs/image-url";

/**
 * The card frame: image area + name strip. A missing or broken image shows the
 * Kobalte fallback (`ImageOffIcon`) after 600ms instead of the browser's broken-image
 * glyph — decision 1 on issue #37.
 */
const DiddlCardUi: Component<{
  name?: string;
  imagePath?: string;
  class?: string;
  nameClass?: string;
}> = (props) => {
  return (
    <div class={cn(props.class)}>
      <div class="h-[calc(100%-20px)] w-full rounded-t border-x border-t border-black/20">
        <ImageRoot fallbackDelay={600} class="h-full w-full">
          <Image
            loading="lazy"
            src={imageUrl(props.imagePath)}
            alt="Diddl image corresponding to the collectible"
          />
          <ImageFallback class="rounded-none bg-muted/60 text-muted-foreground">
            <ImageOffIcon />
          </ImageFallback>
        </ImageRoot>
      </div>
      <div
        class={cn(
          "grid h-5 w-full place-content-center overflow-hidden rounded-b bg-purple-200 px-1 text-purple-950",
          props.nameClass,
        )}
      >
        <span class="truncate">{props.name}</span>
      </div>
    </div>
  );
};
export default DiddlCardUi;
