import { createForm } from "@tanstack/solid-form";
import { For, Show } from "solid-js";
import { z } from "zod";

import { Button } from "@renderer/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@renderer/components/ui/card";
import {
  TextField,
  TextFieldErrorMessage,
  TextFieldLabel,
  TextFieldRoot,
  TextFieldTextArea,
} from "@renderer/components/ui/textfield";
import { useProfile } from "@renderer/features/profile/profile-state";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(200),
  hobbies: z.string(),
  birthdate: z.string(),
  picture: z.union([z.string(), z.instanceof(File)]).nullable(),
});

export default function SettingsSectionProfile() {
  const { profile, actions } = useProfile();
  let fileInputRef: HTMLInputElement | undefined;

  const form = createForm(() => ({
    defaultValues: {
      name: profile()?.name ?? "",
      description: profile()?.description ?? "",
      hobbies: profile()?.hobbies ?? "",
      birthdate: profile()?.birthdate ?? "",
      picture: (profile()?.picturePath ?? null) as string | File | null,
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      if (value.picture instanceof File) {
        const filePath = (value.picture as any).path;
        if (filePath) {
          await actions.updateProfilePicture(filePath);
        }
      }

      await actions.updateProfile({
        name: value.name,
        description: value.description,
        hobbies: value.hobbies,
        birthdate: value.birthdate,
      });
    },
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle class="text-lg">Profile</CardTitle>
        <CardDescription>Let us know who you are!</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          class="flex flex-col gap-8 md:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          {/* Avatar */}
          <form.Field name="picture">
            {(field) => (
              <div class="flex shrink-0 flex-col items-center gap-3">
                <Show
                  when={typeof field().state.value === "string" && field().state.value}
                  fallback={
                    <div class="flex h-40 w-40 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground">
                      No photo
                    </div>
                  }
                >
                  <img
                    src={`file://${field().state.value}`}
                    alt="Profile"
                    class="h-40 w-40 rounded-full object-cover"
                  />
                </Show>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  class="hidden"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0];
                    if (file) field().handleChange(file);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef?.click()}
                >
                  Change Avatar
                </Button>
              </div>
            )}
          </form.Field>

          {/* Form fields */}
          <div class="flex-1 space-y-4">
            <form.Field name="name">
              {(field) => (
                <TextFieldRoot
                  value={field().state.value}
                  onChange={(v) => field().handleChange(v)}
                  validationState={
                    field().state.meta.isTouched && field().state.meta.errors.length > 0
                      ? "invalid"
                      : "valid"
                  }
                >
                  <TextFieldLabel>Name</TextFieldLabel>
                  <TextField onFocusOut={() => field().handleBlur()} />
                  <TextFieldErrorMessage>
                    <For each={field().state.meta.errors}>
                      {(error) => <div>{error?.message}</div>}
                    </For>
                  </TextFieldErrorMessage>
                </TextFieldRoot>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <TextFieldRoot
                  value={field().state.value}
                  onChange={(v) => field().handleChange(v)}
                  validationState={
                    field().state.meta.isTouched && field().state.meta.errors.length > 0
                      ? "invalid"
                      : "valid"
                  }
                >
                  <TextFieldLabel>Description</TextFieldLabel>
                  <TextFieldTextArea rows={3} onFocusOut={() => field().handleBlur()} />
                  <TextFieldErrorMessage>
                    <For each={field().state.meta.errors}>
                      {(error) => <div>{error?.message}</div>}
                    </For>
                  </TextFieldErrorMessage>
                </TextFieldRoot>
              )}
            </form.Field>

            <form.Field name="hobbies">
              {(field) => (
                <TextFieldRoot
                  value={field().state.value}
                  onChange={(v) => field().handleChange(v)}
                  validationState={
                    field().state.meta.isTouched && field().state.meta.errors.length > 0
                      ? "invalid"
                      : "valid"
                  }
                >
                  <TextFieldLabel>Hobbies</TextFieldLabel>
                  <TextField onFocusOut={() => field().handleBlur()} />
                  <TextFieldErrorMessage>
                    <For each={field().state.meta.errors}>
                      {(error) => <div>{error?.message}</div>}
                    </For>
                  </TextFieldErrorMessage>
                </TextFieldRoot>
              )}
            </form.Field>

            <form.Field name="birthdate">
              {(field) => (
                <TextFieldRoot
                  value={field().state.value}
                  onChange={(v) => field().handleChange(v)}
                  validationState={
                    field().state.meta.isTouched && field().state.meta.errors.length > 0
                      ? "invalid"
                      : "valid"
                  }
                >
                  <TextFieldLabel>Birthdate</TextFieldLabel>
                  <TextField type="date" onFocusOut={() => field().handleBlur()} />
                  <TextFieldErrorMessage>
                    <For each={field().state.meta.errors}>
                      {(error) => <div>{error?.message}</div>}
                    </For>
                  </TextFieldErrorMessage>
                </TextFieldRoot>
              )}
            </form.Field>

            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {(state) => (
                <Button type="submit" disabled={!state().canSubmit}>
                  {state().isSubmitting ? "Saving..." : "Save Profile"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
