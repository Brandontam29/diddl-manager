## Context

The settings page has a `SettingsSectionProfile` component with a TanStack Solid Form for editing the user profile. The form currently logs to console on submit. The backend IPC handlers (`UPDATE_USER_PROFILE`, `UPDATE_USER_PICTURE`) and the renderer-side context (`useProfile()` from `UserProvider`) are fully implemented and working. The form just needs to be connected.

## Goals / Non-Goals

**Goals:**
- Wire form submission to `useProfile().actions.updateProfile()` with form field values
- Wire profile picture file input to `useProfile().actions.updateProfilePicture()` using Electron's `File.path`
- Include the returned picture path in the profile update payload
- Access profile data from `useProfile()` context instead of an undefined `profile` variable

**Non-Goals:**
- Modifying backend IPC handlers
- Changing the shared `UpdateProfile` type or validation schema
- Adding new form fields or changing validation rules
- Redesigning the form UI

## Decisions

**Use `useProfile()` context directly in `SettingsSectionProfile`**
The component currently references a bare `profile` variable that doesn't exist. Instead, call `useProfile()` to get both the profile resource (for default values) and the actions (for submit). This is the pattern already established in the codebase.

**Handle picture upload as a two-step process**
1. When the user selects a file, extract the file path via `(file as any).path` (Electron adds this to File objects)
2. Call `updateProfilePicture(filePath)` to copy the image to the app's user images directory
3. Use the returned path as `picturePath` in the profile update

This matches the commented-out approach in the current file and aligns with how the backend handler works.

**Keep the TanStack Form approach**
The form already uses `@tanstack/solid-form` with zod validation. We keep this and just replace the `onSubmit` body with the actual API calls.

## Risks / Trade-offs

- **Electron `File.path`**: Only available in Electron, not standard web APIs. This is acceptable since this is a desktop app. Type assertion `(file as any).path` is needed.
- **Sequential picture upload + profile update**: The picture must be uploaded first to get the stored path, then the profile is updated with that path. If the profile update fails after picture upload, the image file persists as an orphan. This is a minor concern and acceptable for now.
