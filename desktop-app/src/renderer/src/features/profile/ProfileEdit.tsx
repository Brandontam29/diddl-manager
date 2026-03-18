import { TextField as TextFieldPrimitive } from "@kobalte/core/text-field";
import { Component, createSignal } from "solid-js";

import { Profile, UpdateProfile } from "@shared";

import { Button } from "@renderer/components/ui/button";
import { TextField, TextFieldLabel, TextFieldRoot } from "@renderer/components/ui/textfield";
import { cn } from "@renderer/libs/cn";

interface ProfileEditProps {
  profile: Profile;
  onSave: (updates: UpdateProfile) => Promise<void>;
  onCancel: () => void;
}

export const ProfileEdit: Component<ProfileEditProps> = (props) => {
  const [name, setName] = createSignal(props.profile.name || "");
  const [birthdate, setBirthdate] = createSignal(props.profile.birthdate || "");
  const [description, setDescription] = createSignal(props.profile.description || "");
  const [hobbies, setHobbies] = createSignal(props.profile.hobbies || "");
  const [isSaving, setIsSaving] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsSaving(true);
    await props.onSave({
      name: name(),
      birthdate: birthdate(),
      description: description(),
      hobbies: hobbies(),
    });
    setIsSaving(false);
  };

  const textAreaClass =
    "border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-[1.5px] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <form onSubmit={handleSubmit} class="flex flex-col gap-6 p-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold">Edit Profile</h2>
        <div class="flex gap-2">
          <Button variant="outline" onClick={props.onCancel} disabled={isSaving()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving()}>
            {isSaving() ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div class="grid max-w-2xl gap-4">
        <TextFieldRoot>
          <TextFieldLabel>Name</TextFieldLabel>
          <TextField value={name()} onInput={(e) => setName(e.currentTarget.value)} />
        </TextFieldRoot>

        <TextFieldRoot>
          <TextFieldLabel>Birthdate</TextFieldLabel>
          <TextField
            type="date"
            value={birthdate()}
            onInput={(e) => setBirthdate(e.currentTarget.value)}
          />
        </TextFieldRoot>

        <TextFieldRoot>
          <TextFieldLabel>Description</TextFieldLabel>
          <TextFieldPrimitive.TextArea
            class={cn(textAreaClass, "resize-y")}
            value={description()}
            onInput={(e) => setDescription(e.currentTarget.value)}
            rows={4}
          />
        </TextFieldRoot>

        <TextFieldRoot>
          <TextFieldLabel>Hobbies</TextFieldLabel>
          <TextFieldPrimitive.TextArea
            class={cn(textAreaClass, "resize-y")}
            value={hobbies()}
            onInput={(e) => setHobbies(e.currentTarget.value)}
            rows={3}
          />
        </TextFieldRoot>
      </div>
    </form>
  );
};
