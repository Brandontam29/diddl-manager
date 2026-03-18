## 1. Frontend State Management

- [x] 1.1 Implement `updateProfile` function in `@desktop-app/src/renderer/src/features/profile/profile-state.tsx` to call `window.api.updateProfile` and refetch data.
- [x] 1.2 Add `updateProfilePicture` function to `@desktop-app/src/renderer/src/features/profile/profile-state.tsx` to call `window.api.updateProfilePicture` and refetch data.
- [x] 1.3 Expose `updateProfilePicture` in `UserContextValue` and `UserContext.Provider`.

## 2. Profile UI Components

- [x] 2.1 Create a `ProfileView` component in `@desktop-app/src/renderer/src/features/profile/` to display name, birthdate, description, hobbies, and picture.
- [x] 2.2 Create a `ProfileEdit` component in `@desktop-app/src/renderer/src/features/profile/` with form inputs for the profile fields and local state management.
- [x] 2.3 Implement picture upload UI (e.g., a file input or click-to-upload area on the profile picture) that triggers `updateProfilePicture`.
- [x] 2.4 Create a main `ProfilePage` component in `@desktop-app/src/renderer/src/features/profile/` that toggles between `ProfileView` and `ProfileEdit` modes.
- [x] 2.5 Ensure the new `ProfilePage` is routed and accessible within the app.