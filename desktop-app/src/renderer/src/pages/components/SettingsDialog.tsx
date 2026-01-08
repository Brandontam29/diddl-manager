import { Button } from "@kobalte/core/button";
import type { DialogTriggerProps } from "@kobalte/core/dialog";
import { HiOutlineCog6Tooth } from "solid-icons/hi";
import { createSignal } from "solid-js";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@renderer/components/ui/dialog";
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

const SettingsDialog = () => {
  const [zoomOption, setZoomOption] = createSignal(
    ZOOM_OPTIONS.find((option) => option.value === HEIGHT_ZOOM_MAP[uiStore.cardHeight]) ||
      ZOOM_OPTIONS[1],
  );
  return (
    <Dialog>
      <DialogTrigger
        as={(props: DialogTriggerProps) => (
          <Button
            variant="outline"
            class="flex w-full items-center gap-2 px-4 hover:bg-red-100"
            {...props}
          >
            <div class="pb-0.5">
              <HiOutlineCog6Tooth class="h-8 w-8" />
            </div>
            <span>
              <strong>Settings</strong>
            </span>
          </Button>
        )}
      />
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

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

        <DialogFooter>
          <Dialog.CloseButton
            onClick={() => {
              setCardZoomLevel(zoomOption().value);
            }}
          >
            Save changes
          </Dialog.CloseButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
