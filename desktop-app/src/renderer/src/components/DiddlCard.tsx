import { cn } from "@renderer/libs/cn";
import type { LibraryEntry } from "@shared";
import { type Component } from "solid-js";

const DiddlCard: Component<{ diddl: LibraryEntry; className?: string }> = (props) => {
  const baseUrl = new URL("", import.meta.url);
  const finalUrl = new URL(props.diddl.imagePath, baseUrl.origin);
  return (
    <div class={cn(props.className)}>
      <div
        class="h-[calc(100%-20px)] w-full border-t border-x border-black/20 bg-cover rounded-t"
        style={{
          "background-image": `url(${finalUrl.href})`,
          // "background-image": `url(../../../assets/diddl-images/002_STICKERS----COLLECTIONNER/stickers.jpg)`,
        }}
      />
      <div class="text-purple-950 bg-purple-200 h-5 w-full grid place-content-center rounded-b">
        {props.diddl.name}
      </div>
    </div>
  );
};
export default DiddlCard;
