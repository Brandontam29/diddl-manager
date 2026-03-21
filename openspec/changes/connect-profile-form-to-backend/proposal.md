## Why

The settings profile form (`SettingsSectionProfile.tsx`) has form fields and validation but its `onSubmit` only logs to console. The backend IPC handlers for updating the profile and uploading a profile picture already exist but are not wired up from the form. Users cannot save profile changes or upload a profile picture.

## What Changes

- Wire the form's `onSubmit` to call `useProfile().actions.updateProfile()` with form values
- Wire the picture file input to call `useProfile().actions.updateProfilePicture()` using Electron's `File.path` property, then include the returned path in the profile update
- Use the existing `UserProvider` context (`useProfile`) instead of a bare `profile` variable (current code references `profile` without importing or accessing it from context)
- Remove dead commented-out code at the bottom of the file

## Capabilities

### New Capabilities

- `profile-form-submit`: Connect the settings profile form to the backend IPC handlers for saving profile data and uploading a profile picture

### Modified Capabilities

- `profile-management`: The form submission now calls the existing backend update handlers, completing the profile edit flow from the settings page

## Impact

- **Frontend**: `SettingsSectionProfile.tsx` — form submit handler and picture upload logic
- **State**: Uses existing `useProfile()` context from `features/profile/profile-state.tsx`
- **Backend**: No backend changes needed — existing `UPDATE_USER_PROFILE` and `UPDATE_USER_PICTURE` IPC handlers are sufficient
- **Shared models**: No changes needed — `UpdateProfile` type already matches the form fields
