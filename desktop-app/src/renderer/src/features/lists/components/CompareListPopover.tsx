import { GitCompareArrows, X } from "lucide-solid";
import { Component, For, Show, createSignal } from "solid-js";

import { Button } from "@renderer/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@renderer/components/ui/popover";
import { setDiddlStore } from "@renderer/features/diddl";
import { diffList, isDiffModeActive } from "@renderer/features/diddl/diffMode";

import { useLists } from "../lists";

const CompareListPopover: Component = () => {
  const lists = useLists();
  const [open, setOpen] = createSignal(false);
  const activeListName = () => diffList()?.name ?? null;

  return (
    <div class="flex items-center gap-1">
      <Popover open={open()} onOpenChange={setOpen}>
        <PopoverTrigger class="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm hover:bg-gray-100">
          <GitCompareArrows size={14} />
          <Show when={activeListName()} fallback="Compare with List">
            {(name) => <span>{name()}</span>}
          </Show>
        </PopoverTrigger>

        <PopoverContent class="min-w-64">
          <Show when={lists()}>
            <div class="grid grid-cols-2 gap-2">
              <For each={lists()}>
                {(list) => (
                  <Button
                    variant={diffList()?.id === list.id ? "default" : "outline"}
                    onClick={() => {
                      setDiddlStore("diffListId", list.id);
                      setOpen(false);
                    }}
                    class="block"
                  >
                    {list.name}
                  </Button>
                )}
              </For>
            </div>
          </Show>
        </PopoverContent>
      </Popover>

      <Show when={isDiffModeActive()}>
        <button
          class="rounded-md p-1 hover:bg-gray-200"
          onClick={() => setDiddlStore("diffListId", null)}
        >
          <X size={14} />
        </button>
      </Show>
    </div>
  );
};

export default CompareListPopover;
