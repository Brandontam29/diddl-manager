import { Plus } from "lucide-solid";
import { type Component, createSignal } from "solid-js";

import { Button } from "@/components/ui/button";
import { TextField, TextFieldErrorMessage, TextFieldRoot } from "@/components/ui/textfield";
import { listSectionNameSchema } from "@/shared";

import { errorMessage } from "../../mutations";

const CreateSectionForm: Component<{ onCreate: (name: string) => Promise<unknown> }> = (props) => {
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
      await props.onCreate(parsed.data);
      setName("");
    } catch (e) {
      setError(errorMessage(e, "Could not create the section."));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextFieldRoot
        value={name()}
        onChange={setName}
        validationState={error() ? "invalid" : "valid"}
        class="space-y-0"
      >
        <div class="flex items-center gap-2">
          <TextField class="w-auto" placeholder="New section" aria-label="New section name" />
          <Button type="submit" variant="outline" class="flex items-center gap-2 rounded-md">
            <Plus size={16} />
            <span>Section</span>
          </Button>
        </div>
        <div class="h-5">
          <TextFieldErrorMessage>{error()}</TextFieldErrorMessage>
        </div>
      </TextFieldRoot>
    </form>
  );
};

export default CreateSectionForm;
