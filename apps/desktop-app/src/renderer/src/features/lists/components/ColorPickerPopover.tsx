import { revalidate } from "@solidjs/router";
import { Palette } from "lucide-solid";
import { Component, For, createSignal } from "solid-js";

import { Popover, PopoverContent, PopoverTrigger } from "@renderer/components/ui/popover";
import { cn } from "@renderer/libs/cn";
import { transparentOklch } from "@renderer/libs/transparentOklch";
import { trpc } from "@renderer/libs/trpc";

const LIST_COLORS = [
  "oklch(77.2% 0.142 5.8)",
  "oklch(82.7% 0.125 65.4)",
  "oklch(91.2% 0.187 101.3)",
  "oklch(86.3% 0.190 123.6)",
  "oklch(82.9% 0.123 160.8)",
  "oklch(80.3% 0.106 203.4)",
  "oklch(76.4% 0.131 260.4)",
  "oklch(74.3% 0.193 287.2)",
  "oklch(77.7% 0.204 305.7)",
  "oklch(78.2% 0.201 333.8)",
];

const ColorPickerPopover: Component<{ listId: number; currentColor: string }> = (props) => {
  const [open, setOpen] = createSignal(false);

  const handleColorSelect = async (color: string) => {
    await trpc.list.updateColor.mutate({ listId: props.listId, color });
    revalidate("lists");
    setOpen(false);
  };

  const popoverTriggerColor = transparentOklch(props.currentColor, 0.4);
  return (
    <Popover open={open()} onOpenChange={setOpen}>
      <PopoverTrigger
        class={cn(
          "flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 opacity-80 shadow-sm",
          "hover:scale-110",
          "transition-all duration-300 ease-in-out",
        )}
        style={{ "background-color": popoverTriggerColor }}
      >
        <Palette size={14} class="text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent class="w-auto p-2">
        <div class="grid grid-cols-5 gap-1.5">
          <For each={LIST_COLORS}>
            {(color) => (
              <button
                class={cn(
                  "h-6 w-6 rounded-full transition-transform hover:scale-110",
                  "border border-gray-200",
                  "shadow-sm",
                )}
                style={{
                  "background-color": color,
                }}
                onClick={() => {
                  handleColorSelect(color);
                }}
              />
            )}
          </For>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPickerPopover;
