import { cn } from "@renderer/libs/cn";
import type { LibraryEntry } from "@shared";
import { type Component } from "solid-js";
// import.meta.glob("/src/assets/diddl-images/**");
// file:///C:/Users/brand/AppData/Local/Programs/diddl-manager/resources/diddl-images/006_1-50/NBA60003.jpg
const DiddlCard: Component<{ diddl: LibraryEntry; className?: string }> = (props) => {
  const baseUrl = new URL("", import.meta.url);
  const finalUrl = new URL(props.diddl.imagePath, baseUrl.origin);
  console.log(finalUrl);
  return (
    <div class={cn(props.className)}>
      <div
        class="h-[calc(100%-20px)] w-full border-t border-x border-black/20 bg-cover rounded-t"
        style={{
          "background-image": `url(${finalUrl.href})`,
        }}
      />
      <div class="text-purple-950 bg-purple-200 h-5 w-full grid place-content-center rounded-b">
        {props.diddl.name}
      </div>
    </div>
  );
};
export default DiddlCard;
