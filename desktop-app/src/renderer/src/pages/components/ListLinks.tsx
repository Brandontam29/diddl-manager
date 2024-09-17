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
import { type Component, createMemo, createSignal, For } from "solid-js";
import CreateListDialog from "./CreateListDialog";
import { A, useLocation } from "@solidjs/router";
import { Button } from "@kobalte/core/button";
import { cn } from "@renderer/libs/cn";
import { ListPlus } from "lucide-solid";

const ListLinks: Component<{ trackerListItems: TrackerListItem[] | undefined }> = (props) => {
  const location = useLocation();
  const [open, setOpen] = createSignal(false);

  const first4List = createMemo(() => {
    if (!props.trackerListItems) return [];

    const newList = [...props.trackerListItems];

    return newList
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, 4);
  });

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
        <PopoverDescription class="flex flex-col divide-y">
          <CreateListDialog>
            <div class="grow flex items-center gap-2 px-2 py-1 hover:bg-gray-100 mr-4">
              <ListPlus />
              <span>Create New</span>
            </div>
          </CreateListDialog>

          <For each={first4List()}>
            {(item) => (
              <A
                class="py-1 px-2 hover:bg-gray-100"
                href={`/lists/${item.id}`}
                onClick={() => setOpen(false)}
              >
                {item.name}
              </A>
            )}
          </For>
          <A class="py-1 px-2 hover:bg-gray-100" href="/lists" onClick={() => setOpen(false)}>
            See All Lists
          </A>
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  );
};

export default ListLinks;
