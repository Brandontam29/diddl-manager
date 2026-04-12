import { useAction } from "@solidjs/router";

import { Card, CardContent, CardHeader, CardTitle } from "@renderer/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@renderer/components/ui/select";
import { updateUiStateAction, useUiState } from "@renderer/features/ui-state";
import type { DeepMutable } from "@renderer/type-utils";

const ZOOM_OPTIONS = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
  { label: "Extra-Large", value: "xl" },
] as const;

const SettingsSectionUx = () => {
  const uiState = useUiState();
  const submit = useAction(updateUiStateAction);

  const currentOption = () => {
    const size = uiState()?.cardSize ?? "md";
    return ZOOM_OPTIONS.find((option) => option.value === size) || ZOOM_OPTIONS[1];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle class="text-lg">Display Preferences</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2">
        <label class="text-sm font-medium">Card Size</label>
        <Select
          options={ZOOM_OPTIONS as DeepMutable<typeof ZOOM_OPTIONS>}
          optionTextValue="label"
          optionValue="value"
          itemComponent={(props) => (
            <SelectItem item={props.item}>{props.item.rawValue.label}</SelectItem>
          )}
          value={currentOption()}
          onChange={(value) => {
            if (value) submit({ cardSize: value.value });
          }}
        >
          <SelectTrigger>
            <SelectValue<(typeof ZOOM_OPTIONS)[number]>>
              {(state) => state.selectedOption().label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent />
        </Select>
      </CardContent>
    </Card>
  );
};

export default SettingsSectionUx;
