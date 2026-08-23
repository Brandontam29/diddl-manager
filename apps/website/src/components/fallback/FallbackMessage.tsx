import type { Component, JSX } from "solid-js";

import { Image, ImageFallback, ImageRoot } from "@/components/ui/image";
import { Skeleton } from "@/components/ui/skeleton";

import diddlSad from "../../assets/diddl-sad.gif";

/** Sad Diddl + a title + a line of copy: the empty and loading states share one look. */
const FallbackMessage: Component<{ title: string; children: JSX.Element }> = (props) => {
  return (
    <div class="mx-auto max-w-lg space-y-2 text-center">
      <ImageRoot>
        <Image src={diddlSad} alt="Sad Diddl" loading="eager" />
        <ImageFallback>
          <Skeleton class="aspect-square h-[340px] rounded" />
        </ImageFallback>
      </ImageRoot>

      <h1 class="text-lg font-semibold">{props.title}</h1>
      <p>{props.children}</p>
    </div>
  );
};

export default FallbackMessage;
