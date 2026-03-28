import { GitCompareArrows, X } from "lucide-solid";
import { Component, For, Show, createSignal } from "solid-js";

import { Button } from "@renderer/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@renderer/components/ui/popover";
import { diddlStore, setDiddlStore } from "@renderer/features/diddl";
import { isDiffModeActive } from "@renderer/features/diddl/diffMode";

import { useLists } from "../lists";

const CompareListPopover: Component = () => {
  const lists = useLists();
  const [open, setOpen] = createSignal(false);

  const isSelected = (listId: number) => diddlStore.diffListIds.includes(listId);

  const toggleList = (listId: number) => {
    const current = diddlStore.diffListIds;
    if (current.includes(listId)) {
      setDiddlStore(
        "diffListIds",
        current.filter((id) => id !== listId),
      );
    } else {
      setDiddlStore("diffListIds", [...current, listId]);
    }
  };

  const selectAll = () => {
    const allIds = lists()?.map((l) => l.id) ?? [];
    setDiddlStore("diffListIds", allIds);
  };

  const removeList = (listId: number) => {
    setDiddlStore(
      "diffListIds",
      diddlStore.diffListIds.filter((id) => id !== listId),
    );
  };

  const selectedListNames = () => {
    const allLists = lists();
    if (!allLists) return [];
    const selectedIds = new Set(diddlStore.diffListIds);
    return allLists.filter((l) => selectedIds.has(l.id));
  };

  return (
    <div class="flex items-center gap-1">
      <Popover open={open()} onOpenChange={setOpen}>
        <PopoverTrigger class="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm hover:bg-gray-100">
          <GitCompareArrows size={14} />
          <Show when={isDiffModeActive()} fallback="Compare with List">
            <span>{diddlStore.diffListIds.length} lists selected</span>
          </Show>
        </PopoverTrigger>

        <PopoverContent class="min-w-64">
          <Show when={lists()}>
            <div>
              <div class="grid grid-cols-2 gap-2">
                <For each={lists()}>
                  {(list) => (
                    <Button
                      variant={isSelected(list.id) ? "default" : "outline"}
                      onClick={() => toggleList(list.id)}
                      class="block"
                    >
                      {list.name}
                    </Button>
                  )}
                </For>
              </div>
              <Button onClick={selectAll} class="mt-2 block w-full">
                Select All
              </Button>
            </div>
          </Show>
        </PopoverContent>
      </Popover>

      <Show when={isDiffModeActive()}>
        <div class="flex items-center gap-1">
          <For each={selectedListNames()}>
            {(list) => (
              <span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                {list.name}
                <button class="rounded-full hover:bg-gray-300" onClick={() => removeList(list.id)}>
                  <X size={12} />
                </button>
              </span>
            )}
          </For>
          <button
            class="rounded-md p-1 hover:bg-gray-200"
            onClick={() => setDiddlStore("diffListIds", [])}
          >
            <X size={14} />
          </button>
        </div>
      </Show>
    </div>
  );
};

export default CompareListPopover;
