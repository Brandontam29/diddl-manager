import { Popover, PopoverContent, PopoverTrigger } from "@renderer/components/ui/popover";

import { Button } from "@renderer/components/ui/button";
import { PopoverTriggerProps } from "@kobalte/core/popover";
import { Plus } from "lucide-solid";
const FilterPopover = () => {
  const handleSubmit = (event: Event) => {
    event.preventDefault();

    // Type assertion is used to specify that event.target is an HTMLFormElement
    const form = event.target as HTMLFormElement;

    // Extract values from the form elements
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const age = formData.get("age") as string;

    alert(`Name: ${name}, Age: ${age}`);
  };

  return (
    <Popover>
      <PopoverTrigger
        as={(props: PopoverTriggerProps) => (
          <Button variant="outline" {...props} class="flex items-center rounded-full">
            <Plus />
            <span>Add Filters</span>
          </Button>
        )}
      />

      <PopoverContent class="min-w-96">
        <form>
          <label>Condition</label>
        </form>
      </PopoverContent>
    </Popover>
  );
};

/**
 * filters
 *
 * mint
 * is damaged
 *
 * complete
 * incomplete
 *
 * type
 *
 * min quantity
 * max quantity
 */
export default FilterPopover;
