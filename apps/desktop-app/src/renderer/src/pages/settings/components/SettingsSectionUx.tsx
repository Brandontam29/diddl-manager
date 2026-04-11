import { createSignal } from "solid-js";

import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from "@renderer/components/section/two-column";
import { Button } from "@renderer/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@renderer/components/ui/select";
import {
  HEIGHT_ZOOM_MAP,
  setCardZoomLevel,
  uiStore,
} from "@renderer/features/settings/legacy-index";
import type { DeepMutable } from "@renderer/type-utils";

const ZOOM_OPTIONS = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
  { label: "Extra-Large", value: "xl" },
] as const;

const SettingsSectionUx = () => {
  const [zoomOption, setZoomOption] = createSignal(
    ZOOM_OPTIONS.find((option) => option.value === HEIGHT_ZOOM_MAP[uiStore.cardHeight]) ||
      ZOOM_OPTIONS[1],
  );
  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Settings</SectionTitle>
      </SectionHeader>

      <SectionContent class="space-y-2">
        <label class="block">Card Sizes</label>
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
          class="mt-4"
          onClick={() => {
            setCardZoomLevel(zoomOption().value);
          }}
        >
          Save changes
        </Button>
      </SectionContent>
    </Section>
  );
};

export default SettingsSectionUx;
