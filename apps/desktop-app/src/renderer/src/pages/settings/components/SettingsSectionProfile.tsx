import { createForm } from "@tanstack/solid-form";
import { createEffect, For, Show } from "solid-js";
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
import { trpc } from "@renderer/libs/trpc";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(200),
  hobbies: z.string(),
  birthdate: z.string(),
});

export default function SettingsSectionProfile() {
  const { profile, actions } = useProfile();

  const form = createForm(() => ({
    defaultValues: {
      name: profile()?.name ?? "",
      description: profile()?.description ?? "",
      hobbies: profile()?.hobbies ?? "",
      birthdate: profile()?.birthdate ?? "",
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      await actions.updateProfile({
        name: value.name,
        description: value.description,
        hobbies: value.hobbies,
        birthdate: value.birthdate,
      });
    },
  }));

  async function handleAvatarChange() {
    const filePath = await trpc.fileSystem.pickImage.mutate();
    if (filePath) {
      await actions.updateProfilePicture(filePath);
    }
  }

  createEffect(() => console.log("profile", profile()));

  return (
    <Card>
      <CardHeader>
        <CardTitle class="text-lg">Profile</CardTitle>
        <CardDescription>Let us know who you are!</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col gap-8 md:flex-row">
          {/* Avatar */}
          <div class="flex shrink-0 flex-col items-center gap-3">
            <Show
              when={profile()?.picturePath}
              fallback={
                <div class="flex h-40 w-40 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground">
                  No photo
                </div>
              }
            >
              {(picturePath) => (
                <img
                  src={picturePath()}
                  alt="Profile"
                  class="h-50 w-50 rounded-full border border-gray-400 object-cover"
                />
              )}
            </Show>
            <Button type="button" variant="outline" size="sm" onClick={handleAvatarChange}>
              Change Avatar
            </Button>
          </div>

          {/* Form fields */}
          <form
            class="flex-1 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
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
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
