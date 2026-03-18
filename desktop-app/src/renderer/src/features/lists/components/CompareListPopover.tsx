import { GitCompareArrows, X } from "lucide-solid";
import { Component, For, Show, createMemo, createSignal } from "solid-js";

import { Button } from "@renderer/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@renderer/components/ui/popover";
import { diddlStore, setDiddlStore } from "@renderer/features/diddl";

import { useLists } from "../lists";

const CompareListPopover: Component = () => {
  const lists = useLists();
  const [open, setOpen] = createSignal(false);
  const isDiffMode = createMemo(() => diddlStore.diffListId !== null);
  const activeListName = createMemo(() => {
    const id = diddlStore.diffListId;
    if (id === null) return null;
    return lists()?.find((l) => l.id === id)?.name ?? null;
  });

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
                    variant={diddlStore.diffListId === list.id ? "default" : "outline"}
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

      <Show when={isDiffMode()}>
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
