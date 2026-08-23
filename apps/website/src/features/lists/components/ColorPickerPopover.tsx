import { Palette } from "lucide-solid";
import { Component, For, createSignal } from "solid-js";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/libs/cn";
import { LIST_COLORS, type ListColor } from "@/shared";

const ColorPickerPopover: Component<{
  currentColor: string;
  onSelect: (color: ListColor) => Promise<unknown>;
}> = (props) => {
  const [open, setOpen] = createSignal(false);

  const handleColorSelect = async (color: ListColor) => {
    await props.onSelect(color);
    setOpen(false);
  };

  return (
    <Popover open={open()} onOpenChange={setOpen}>
      <PopoverTrigger
        class={cn(
          "flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 opacity-80 shadow-sm",
          "hover:scale-110",
          "transition-all duration-300 ease-in-out",
        )}
        style={{
          "background-color": `color-mix(in oklch, ${props.currentColor} 40%, transparent)`,
        }}
        aria-label="Change list color"
      >
        <Palette size={14} class="text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent class="w-auto p-2">
        <div class="grid grid-cols-5 gap-1.5">
          <For each={LIST_COLORS}>
            {(color) => (
              <button
                type="button"
                class={cn(
                  "h-6 w-6 rounded-full transition-transform hover:scale-110",
                  "border border-gray-200",
                  "shadow-sm",
                )}
                style={{
                  "background-color": color,
                }}
                aria-label={`Use color ${color}`}
                onClick={() => {
                  void handleColorSelect(color);
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
