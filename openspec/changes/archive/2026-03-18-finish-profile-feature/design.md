## Context

The backend already has functional database handlers for fetching, updating the profile, and handling profile picture uploads via IPC.
The frontend has an empty `updateProfile` action in `profile-state.tsx`.
Users cannot see or edit their profile in the app because the UI components are missing.

## Goals / Non-Goals

**Goals:**
- Implement the `updateProfile` function in `profile-state.tsx` to communicate with the IPC handlers.
- Create UI components for displaying the profile.
- Create UI components for editing the profile details (name, birthdate, description, hobbies).
- Create UI for uploading and changing the profile picture.
- Ensure state updates correctly and refetches the profile after modifications.

**Non-Goals:**
- Modifying the existing SQLite database schema (it currently exists and is sufficient).
- Implementing authentication or multiple user profiles (out of scope).

## Decisions

- **State Management**: We will complete the `updateProfile` action in `profile-state.tsx` to call the IPC endpoint and immediately trigger a profile refetch so the UI stays in sync. For picture updates, a separate `updateProfilePicture` action will be added.
- **UI Components**: Create UI components (e.g. `ProfileView`, `ProfileEdit`) in `@desktop-app/src/renderer/src/features/profile/` to separate display and editing modes.
- **Form State**: Local component state will handle form inputs before submitting the update to avoid spamming IPC calls.

## Risks / Trade-offs

- [Risk] IPC calls fail or time out. → Mitigation: Add error handling in the frontend components and display user-friendly error messages if the backend returns an error.
- [Risk] Large image uploads might be slow. → Mitigation: The backend copies the file locally, which is fast, but we'll add a loading state in the UI to provide visual feedback during picture upload.