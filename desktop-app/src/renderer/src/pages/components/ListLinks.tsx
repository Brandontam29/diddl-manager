import type { PopoverTriggerProps } from "@kobalte/core/popover";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@renderer/components/ui/popover";
import type { TrackerListItem } from "@shared/index";
import { BsCaretDown, BsCaretRight } from "solid-icons/bs";
import { type Component, createEffect, createMemo, createSignal, For } from "solid-js";
import CreateListDialog from "./CreateListDialog";
import { A, useLocation } from "@solidjs/router";
import { Button } from "@kobalte/core/button";
import { cn } from "@renderer/libs/cn";

const ListLinks: Component<{ trackerListItems: TrackerListItem[] | undefined }> = (props) => {
  const location = useLocation();
  const [open, setOpen] = createSignal(false);

  const first4List = createMemo(() =>
    props.trackerListItems
      ?.filter((item) => item.name !== "Collection")
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, 4),
  );

  createEffect(() => console.log(first4List()));
  return (
    <Popover open={open()} onOpenChange={setOpen}>
      <PopoverTrigger
        as={(props: PopoverTriggerProps) => (
          <Button
            {...props}
            class={cn(
              "flex items-center gap-2 px-4",
              location.pathname.includes("lists") && "bg-red-200",
              !location.pathname.includes("lists") && "hover:bg-red-100",
            )}
          >
            <div class="pb-0.5">
              {open() ? <BsCaretDown class="h-8 w-8" /> : <BsCaretRight class="h-8 w-8" />}
            </div>
            <span>Lists</span>
          </Button>
        )}
      />
      <PopoverContent class="">
        <PopoverTitle class="sr-only">List Popover</PopoverTitle>
        <PopoverDescription class="">
          <CreateListDialog />

          <For each={first4List()}>{(item) => <A href={`/lists/${item.id}`}>{item.name}</A>}</For>
          <A href="/lists">See All Lists</A>
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  );
};

export default ListLinks;
