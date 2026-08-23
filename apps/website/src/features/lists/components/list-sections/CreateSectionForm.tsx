import { Plus } from "lucide-solid";
import { Show, createSignal } from "solid-js";

import { Button } from "@/components/ui/button";
import { listSectionNameSchema } from "@/shared";

import { errorMessage, useSectionMutations } from "../../mutations";

const CreateSectionForm = () => {
  const { createSection } = useSectionMutations();
  const [name, setName] = createSignal("");
  const [error, setError] = createSignal("");

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setError("");

    const parsed = listSectionNameSchema.safeParse(name());
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid section name");
      return;
    }

    try {
      await createSection(parsed.data);
      setName("");
    } catch (e) {
      setError(errorMessage(e, "Could not create the section."));
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
          aria-label="New section name"
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
