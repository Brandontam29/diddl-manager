import { Palette } from "lucide-solid";
import { Component, For, createSignal } from "solid-js";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/libs/cn";
import { transparentOklch } from "@/libs/transparentOklch";

import { runMutation, useListMutations } from "../mutations";

/** The desktop palette; the server picks a new list's colour from the same ten. */
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
  const { updateListColor } = useListMutations();

  const handleColorSelect = async (color: string) => {
    await runMutation("Change color", () => updateListColor(props.listId, color));
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
        style={{ "background-color": transparentOklch(props.currentColor, 0.4) }}
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
