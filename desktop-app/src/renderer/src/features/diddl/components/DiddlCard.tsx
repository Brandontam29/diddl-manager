import type { Diddl } from "@shared";
import { ImageOffIcon } from "lucide-solid";
import { type Component } from "solid-js";

import { Image, ImageFallback, ImageRoot } from "@renderer/components/ui/image";
import { cn } from "@renderer/libs/cn";

const DiddlCard: Component<{ diddl: Diddl; className?: string }> = (props) => {
  return (
    <div class={cn(props.className)}>
      <div class="h-[calc(100%-20px)] w-full rounded-t border-x border-t border-black/20">
        <ImageRoot fallbackDelay={600} class="h-full w-full">
          <Image
            loading="lazy"
            src={props.diddl.imagePath}
            alt="Diddl image corresponding to the collectible"
          />
          <ImageFallback>
            <ImageOffIcon />
          </ImageFallback>
        </ImageRoot>
      </div>
      <div class="grid h-5 w-full place-content-center rounded-b bg-purple-200 text-purple-950">
        {props.diddl.name}
      </div>
    </div>
  );
};
export default DiddlCard;
