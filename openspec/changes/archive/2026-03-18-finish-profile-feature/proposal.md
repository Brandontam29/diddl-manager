## Why

The profile feature is currently incomplete. The backend handlers for fetching and updating user profiles, as well as uploading profile pictures, are partially or fully implemented, but the frontend state management (`profile-state.tsx`) has empty functions for updating the profile. Additionally, the UI components for users to view and edit their profile are missing. Finishing this feature is essential so users can actually personalize their experience within the app.

## What Changes

- Complete the frontend state management for the profile feature (implementing `updateProfile` and ensuring reactivity).
- Implement the UI components for viewing the user profile.
- Implement the UI components and forms for editing the user profile (name, birthdate, description, hobbies).
- Implement the UI for uploading and changing the user's profile picture.
- Connect the frontend UI to the existing backend IPC handlers (`get-user-profile`, `update-user-profile`, `update-user-picture`).

## Capabilities

### New Capabilities

- `profile-management`: Allow users to view and update their profile details and profile picture.

### Modified Capabilities

## Impact

- `@desktop-app/src/renderer/src/features/profile/profile-state.tsx` will be updated to correctly call backend IPCs.
- New UI components will be added in `@desktop-app/src/renderer/src/features/profile/`.
- Minor updates may be required in `@desktop-app/src/main/profile/` to ensure robust error handling and type safety.