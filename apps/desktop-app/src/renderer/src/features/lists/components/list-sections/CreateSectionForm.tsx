import { useAction } from "@solidjs/router";
import { Plus } from "lucide-solid";
import { Show, createSignal } from "solid-js";

import { Button } from "@renderer/components/ui/button";
import { createListSectionAction } from "@renderer/features/lists";

import { getErrorMessage } from "./errors";

const CreateSectionForm = () => {
  const createSection = useAction(createListSectionAction);
  const [name, setName] = createSignal("");
  const [error, setError] = createSignal("");

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setError("");

    try {
      await createSection(name());
      setName("");
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <form class="flex flex-col gap-1" onSubmit={handleSubmit}>
      <div class="flex items-center gap-2">
        <input
          value={name()}
          onInput={(event) => setName(event.currentTarget.value)}
          class="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          placeholder="New section"
        />
        <Button type="submit" variant="outline" class="flex items-center gap-2 rounded-md">
          <Plus size={16} />
          <span>Section</span>
        </Button>
      </div>
      <div class="h-5">
        <Show when={error()}>
          <span class="text-xs text-destructive">{error()}</span>
        </Show>
      </div>
    </form>
  );
};

export default CreateSectionForm;
