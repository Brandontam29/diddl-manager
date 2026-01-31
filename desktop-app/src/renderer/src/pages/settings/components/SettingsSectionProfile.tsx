import { AnyFieldApi, createForm } from "@tanstack/solid-form";
import { Component, For, Show, createMemo, createSignal, onMount } from "solid-js";
import { z } from "zod";

import { Profile } from "@shared";

import {
  Section,
  SectionContent,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@renderer/components/section/two-column";
import { Button } from "@renderer/components/ui/button";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(200),
  hobbies: z.string(),
  birthdate: z.string(),
  picture: z.any().nullable().optional(),
});

export default function SettingsSectionProfile() {
  const [profileId, setProfileId] = createSignal<number | null>(null);

  const form = createForm(() => ({
    defaultValues: {
      name: profile.name,
      description: profile.description || "",
      hobbies: profile.hobbies || "",
      birthdate: profile.birthdate || "",

      picture: profile.picturePath,
    },
    validators: {
      onChange: profileSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  }));

  onMount(async () => {
    const profile = (await window.api.getProfile()) as Profile | null;
    if (profile) {
      setProfileId(profile.id);
      setInitialValues({
        name: profile.name,
        description: profile.description || "",
        hobbies: profile.hobbies || "",
        birthdate: profile.birthdate || "",
        picture: profile.picturePath,
      });
      // Update form values after fetching
      form.setFieldValue("name", profile.name);
      form.setFieldValue("description", profile.description || "");
      form.setFieldValue("hobbies", profile.hobbies || "");
      form.setFieldValue("birthdate", profile.birthdate || "");
      form.setFieldValue("picture", profile.picturePath);
    }
  });

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>Edit Profile</SectionTitle>
        <SectionDescription>Let us know who you are!</SectionDescription>
      </SectionHeader>
      <SectionContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          {/* Name Field */}
          <form.Field name="name">
            {(field) => (
              <div style={{ "margin-bottom": "1rem" }}>
                <label style={{ display: "block" }}>Name:</label>
                <input
                  value={field().state.value}
                  onInput={(e) => field().handleChange(e.currentTarget.value)}
                  onBlur={field().handleBlur}
                  style={{ width: "100%", padding: "8px" }}
                />
                <FieldInfo field={field()} />
              </div>
            )}
          </form.Field>

          {/* Description Field */}
          <form.Field name="description">
            {(field) => (
              <div style={{ "margin-bottom": "1rem" }}>
                <label style={{ display: "block" }}>Description:</label>
                <textarea
                  value={field().state.value}
                  onInput={(e) => field().handleChange(e.currentTarget.value)}
                  onBlur={field().handleBlur}
                  rows={4}
                  style={{ width: "100%", padding: "8px" }}
                />
                <FieldInfo field={field()} />
              </div>
            )}
          </form.Field>

          {/* Hobbies Field */}
          <form.Field name="hobbies">
            {(field) => (
              <div style={{ "margin-bottom": "1rem" }}>
                <label style={{ display: "block" }}>Hobbies:</label>
                <input
                  value={field().state.value}
                  onInput={(e) => field().handleChange(e.currentTarget.value)}
                  onBlur={field().handleBlur}
                  style={{ width: "100%", padding: "8px" }}
                />
                <FieldInfo field={field()} />
              </div>
            )}
          </form.Field>

          {/* Birthdate Field */}
          <form.Field name="birthdate">
            {(field) => (
              <div style={{ "margin-bottom": "1rem" }}>
                <label style={{ display: "block" }}>Birthdate:</label>
                <input
                  type="date"
                  value={field().state.value}
                  onInput={(e) => field().handleChange(e.currentTarget.value)}
                  onBlur={field().handleBlur}
                  style={{ width: "100%", padding: "8px" }}
                />
                <FieldInfo field={field()} />
              </div>
            )}
          </form.Field>

          {/* Picture Field */}
          <form.Field name="picture">
            {(field) => (
              <div style={{ "margin-bottom": "1rem" }}>
                <label style={{ display: "block" }}>Profile Picture:</label>

                <Show when={typeof field().state.value === "string" && field().state.value}>
                  <img
                    src={`file://${field().state.value}`}
                    alt="Profile"
                    style={{
                      width: "100px",
                      height: "100px",
                      "object-fit": "cover",
                      "margin-bottom": "10px",
                    }}
                  />
                </Show>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0] || null;
                    if (file) {
                      field().handleChange(file);
                    }
                  }}
                />
                <FieldInfo field={field()} />
              </div>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
          >
            {(state) => (
              <Button type="submit" disabled={!state().canSubmit}>
                {state().isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </SectionContent>
    </Section>
  );
}

const FieldInfo: Component<{ field: AnyFieldApi }> = (props) => {
  const meta = createMemo(() => props.field.state.meta);
  return (
    <div style={{ "font-size": "0.8rem", color: "red", "margin-top": "4px" }}>
      <Show when={meta().isTouched && meta().errors.length > 0}>
        <For each={meta().errors}>{(error) => <div>{error.message}</div>}</For>
      </Show>
    </div>
  );
};

/**
 *   console.log("Form Submitted:", value);

    //   let picturePath = typeof value.picture === 'string' ? value.picture : null;

    //   // specific logic if it is a File object (uploading new)
    //   if (value.picture && value.picture instanceof File) {
    //     // Electron adds 'path' to File object
    //     const filePath = (value.picture as any).path;
    //     console.log("File path:", filePath);
    //     if (filePath) {
    //       const result = await window.api.updateProfilePicture(filePath);
    //       if (result.success) {
    //         picturePath = result.path;
    //       }
    //     }
    //   }

    //   await window.api.updateProfile({
    //     name: value.name,
    //     description: value.description,
    //     hobbies: value.hobbies || null,
    //     birthdate: value.birthdate || null,
    //     picturePath: picturePath,
    //   });
    //   alert("Profile updated successfully!");
    // },
 */
