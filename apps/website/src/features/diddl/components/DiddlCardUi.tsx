import { ImageOffIcon } from "lucide-solid";
import { type Component, Show, createSignal } from "solid-js";

import { cn } from "@/libs/cn";
import { imageUrl } from "@/libs/image-url";

/**
 * The card frame: image area + name strip. A missing (561 Catalog entries, #37) or
 * broken image shows `ImageOffIcon` in place of the browser's broken-image glyph.
 * A plain `<img loading="lazy">` rather than Kobalte's `Image`, whose preload effect
 * would fetch all 150 JPEGs of a window up front.
 */
const DiddlCardUi: Component<{
  name?: string;
  imagePath?: string;
  class?: string;
  nameClass?: string;
}> = (props) => {
  const [broken, setBroken] = createSignal(false);
  const src = () => imageUrl(props.imagePath);

  return (
    <div class={cn(props.class)}>
      <div class="h-[calc(100%-20px)] w-full overflow-hidden rounded-t border-x border-t border-black/20">
        <Show
          when={src() && !broken()}
          fallback={
            <div class="flex h-full w-full items-center justify-center bg-muted/60 text-muted-foreground">
              <ImageOffIcon />
            </div>
          }
        >
          <img
            class="h-full w-full"
            loading="lazy"
            src={src()}
            alt="Diddl image corresponding to the collectible"
            onError={() => setBroken(true)}
          />
        </Show>
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
