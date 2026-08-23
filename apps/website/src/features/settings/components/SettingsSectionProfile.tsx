import { createForm } from "@tanstack/solid-form";
import { useRouter } from "@tanstack/solid-router";
import { For, Show } from "solid-js";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, ImageFallback, ImageRoot } from "@/components/ui/image";
import {
  TextField,
  TextFieldErrorMessage,
  TextFieldLabel,
  TextFieldRoot,
  TextFieldTextArea,
} from "@/components/ui/textfield";
import { useAppData } from "@/features/app-data";
import { useClerk } from "@/lib/clerk-provider";
import { updateProfile } from "@/server/api";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(200),
  hobbies: z.string(),
  birthdate: z.string(),
});

/**
 * The desktop's profile card minus picture upload: the avatar is Clerk's `imageUrl`
 * (spec §3, §6) and is changed through the Clerk user profile in the Account card.
 * The profile itself comes from the `/app` loader; saving calls `updateProfile`
 * and `router.invalidate()` re-runs that loader.
 */
export default function SettingsSectionProfile() {
  const appData = useAppData();
  const router = useRouter();
  const { user } = useClerk();

  const profile = () => appData().profile;

  const form = createForm(() => ({
    defaultValues: {
      name: profile().name,
      description: profile().description,
      hobbies: profile().hobbies,
      birthdate: profile().birthdate ?? "",
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      await updateProfile({
        data: {
          name: value.name,
          description: value.description,
          hobbies: value.hobbies,
          // The column is a Postgres `date`; an empty input clears it.
          birthdate: value.birthdate === "" ? null : value.birthdate,
        },
      });
      await router.invalidate();
    },
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle class="text-lg">Profile</CardTitle>
        <CardDescription>Let us know who you are!</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col gap-8 md:flex-row">
          {/* Avatar — Clerk's, changed through the Account card below */}
          <div class="flex shrink-0 flex-col items-center gap-3">
            <ImageRoot class="size-40 overflow-hidden rounded-full border border-gray-400">
              <Show when={user()?.imageUrl}>
                {(src) => <Image src={src()} alt="Profile" class="object-cover" />}
              </Show>
              <ImageFallback class="text-sm text-muted-foreground">No photo</ImageFallback>
            </ImageRoot>
            <p class="max-w-40 text-center text-xs text-muted-foreground">
              Change your photo under Account below.
            </p>
          </div>

          {/* Form fields */}
          <form
            class="flex-1 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
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
                  <TextField name="name" onFocusOut={() => field().handleBlur()} />
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
                  <TextFieldTextArea
                    name="description"
                    rows={3}
                    onFocusOut={() => field().handleBlur()}
                  />
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
                  <TextField name="hobbies" onFocusOut={() => field().handleBlur()} />
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
                  <TextField name="birthdate" type="date" onFocusOut={() => field().handleBlur()} />
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
