import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type CardSize, cardSize, setCardSize } from "@/features/ui-state/card-size";

type ZoomOption = { label: string; value: CardSize };

const ZOOM_OPTIONS: ZoomOption[] = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
  { label: "Extra-Large", value: "xl" },
];

/** Card size is UI state, so it lives in `localStorage` only (spec §3) — no server call. */
const SettingsSectionUx = () => {
  const currentOption = () =>
    ZOOM_OPTIONS.find((option) => option.value === cardSize()) ?? ZOOM_OPTIONS[1]!;

  return (
    <Card>
      <CardHeader>
        <CardTitle class="text-lg">Display Preferences</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2">
        <label class="text-sm font-medium" id="card-size-label">
          Card Size
        </label>
        <Select<ZoomOption>
          options={ZOOM_OPTIONS}
          optionTextValue="label"
          optionValue="value"
          itemComponent={(props) => (
            <SelectItem item={props.item}>{props.item.rawValue.label}</SelectItem>
          )}
          value={currentOption()}
          onChange={(value) => {
            if (value) setCardSize(value.value);
          }}
        >
          <SelectTrigger aria-labelledby="card-size-label">
            <SelectValue<ZoomOption>>{(state) => state.selectedOption().label}</SelectValue>
          </SelectTrigger>
          <SelectContent />
        </Select>
      </CardContent>
    </Card>
  );
};

export default SettingsSectionUx;
