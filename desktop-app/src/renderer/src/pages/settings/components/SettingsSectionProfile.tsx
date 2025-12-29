import { AnyFieldApi, createForm, FieldApi } from "@tanstack/solid-form";
import { z } from "zod";
import { Component, createEffect, createMemo, For, Show } from "solid-js";
import {
  Section,
  SectionContent,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@renderer/components/section/two-column";
import { Button } from "@renderer/components/ui/button";
import { cn } from "@renderer/libs/cn";

// 1. Define your validation schema with Zod
const userProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(200),
  // For file uploads, we validate that it's an instance of File
  picture: z.instanceof(File, { message: "Please upload a valid image" }).nullable(),
});

type UserProfile = z.infer<typeof userProfileSchema>;

export default function SettingsSectionProfile() {
  const { Field, handleSubmit, state, Subscribe, ...rest } = createForm(() => ({
    defaultValues: {
      name: "",
      description: "",
      picture: null as File | null,
    },
    validators: {
      onChange: userProfileSchema,
    },
    onSubmit: async ({ value }) => {
      console.log("Form Submitted:", value);
      alert("Profile updated successfully!");
    },
  }));
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
            handleSubmit();
          }}
        >
          <div
            class={cn(
              "relative items-center justify-center rounded-xl p-1",
              "after:absolute after:inset-[-10%] after:animate-border-spin",
              "after:bg-[radial-gradient(18%_28%_at_24%_50%,#CEFAFFFF_7%,#073AFF00_100%),radial-gradient(18%_28%_at_18%_71%,#FFFFFF59_6%,#073AFF00_100%),radial-gradient(70%_53%_at_36%_76%,#73F2FFFF_0%,#073AFF00_100%),radial-gradient(42%_53%_at_15%_94%,#FFFFFFFF_7%,#073AFF00_100%),radial-gradient(42%_53%_at_34%_72%,#FFFFFFFF_7%,#073AFF00_100%),radial-gradient(18%_28%_at_35%_87%,#FFFFFFFF_7%,#073AFF00_100%),radial-gradient(31%_43%_at_7%_98%,#FFFFFFFF_24%,#073AFF00_100%),radial-gradient(21%_37%_at_72%_23%,#D3FF6D9C_24%,#073AFF00_100%),radial-gradient(35%_56%_at_91%_74%,#8A4FFFF5_9%,#073AFF00_100%),radial-gradient(74%_86%_at_67%_38%,#6DFFAEF5_24%,#073AFF00_100%),linear-gradient(125deg,#4EB5FFFF_1%,#4C00FCFF_100%)]",
              "after:content-[''] overflow-hidden",
            )}
          >
            <div class="bg-gray-200 relative z-10 flex h-full w-full items-center justify-center rounded-xl">
              Pseudo-element Border
            </div>
          </div>
          {/* Name Field */}
          <Field name="name">
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
          </Field>

          <div
            class="box-gradient-border animate-bg-spin hover:paused 
              flex h-[50vmin] w-[60vmin] items-center justify-center 
              rounded-[2em] border-5 border-transparent text-white 
              shadow-[0_1px_0_#000]"
          >
            <span class="text-xl font-medium">Hover to Pause</span>
          </div>

          {/* Description Field */}
          <Field name="description">
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
          </Field>

          {/* Picture Field */}
          <Field name="picture">
            {(field) => (
              <div style={{ "margin-bottom": "1rem" }}>
                <label style={{ display: "block" }}>Profile Picture:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0] || null;
                    field().handleChange(file);
                  }}
                />
                <FieldInfo field={field()} />
              </div>
            )}
          </Field>

          <Subscribe
            selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
          >
            {(state) => (
              <Button type="submit" disabled={!state().canSubmit}>
                {state().isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
            )}
          </Subscribe>
        </form>
      </SectionContent>
    </Section>
  );
}

const FieldInfo: Component<{ field: AnyFieldApi }> = (props) => {
  const meta = createMemo(() => props.field.state.meta);
  createEffect(() => console.log("meta", meta()));
  return (
    <div style={{ "font-size": "0.8rem", color: "red", "margin-top": "4px" }}>
      <Show when={meta().isTouched && meta().errors.length}>
        <For each={meta().errors}>{(error) => <div>{error.message}</div>}</For>
      </Show>
    </div>
  );
};
