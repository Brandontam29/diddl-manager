import { cn } from "@renderer/libs/cn";
import type { Diddl } from "@shared";
import { type Component } from "solid-js";
import { Image, ImageFallback, ImageRoot } from "./ui/image";
import diddlTransparent from "@renderer/assets/diddl-transparent.jpg";

const DiddlCard: Component<{ diddl: Diddl; className?: string }> = (props) => {
  return (
    <div class={cn(props.className)}>
      <div class="h-[calc(100%-20px)] w-full border-t border-x border-black/20 rounded-t">
        <ImageRoot fallbackDelay={600} class="h-full w-full">
          <Image
            loading="lazy"
            src={props.diddl.imagePath}
            alt="Diddl image corresponding to the collectible"
          />
          <ImageFallback>
            <img src={diddlTransparent} alt="Diddl welcoming you to wait a little longer." />
          </ImageFallback>
        </ImageRoot>
      </div>
      <div class="text-purple-950 bg-purple-200 h-5 w-full grid place-content-center rounded-b">
        {props.diddl.name}
      </div>
    </div>
  );
};
export default DiddlCard;
