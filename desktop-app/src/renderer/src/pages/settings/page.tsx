import { Button } from "@kobalte/core/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@renderer/components/ui/select";
import { HEIGHT_ZOOM_MAP, setCardZoomLevel, uiStore } from "@renderer/features/ui-state";
import type { DeepMutable } from "@renderer/type-utils";
import { createSignal } from "solid-js";

const ZOOM_OPTIONS = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
  { label: "Extra-Large", value: "xl" },
] as const;
const SettingsPage = () => {
  const [zoomOption, setZoomOption] = createSignal(
    ZOOM_OPTIONS.find((option) => option.value === HEIGHT_ZOOM_MAP[uiStore.cardHeight]) ||
      ZOOM_OPTIONS[1],
  );
  return (
    <div class="grow px-4 py-8">
      <h1 class="text-xl font-bold">Settings</h1>

      <Select
        options={ZOOM_OPTIONS as DeepMutable<typeof ZOOM_OPTIONS>}
        optionTextValue="label"
        optionValue="value"
        itemComponent={(props) => (
          <SelectItem item={props.item}>{props.item.rawValue.label}</SelectItem>
        )}
        value={zoomOption()}
        onChange={(value) => setZoomOption(value || ZOOM_OPTIONS[1])}
      >
        <SelectTrigger>
          <SelectValue<(typeof ZOOM_OPTIONS)[number]>>
            {(state) => state.selectedOption().label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent />
      </Select>

      <Button
        onClick={() => {
          setCardZoomLevel(zoomOption().value);
        }}
      >
        Save changes
      </Button>
    </div>
  );
};

export default SettingsPage;
