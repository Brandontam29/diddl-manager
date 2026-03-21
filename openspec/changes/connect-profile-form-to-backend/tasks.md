## 1. Access Profile Context

- [x] 1.1 Import `useProfile` from `@renderer/features/profile` in `SettingsSectionProfile.tsx`
- [x] 1.2 Call `useProfile()` to get the profile resource and actions (`updateProfile`, `updateProfilePicture`)
- [x] 1.3 Replace bare `profile` references in form `defaultValues` with profile resource data (handle loading/null state)

## 2. Wire Form Submission

- [x] 2.1 Replace the console.log `onSubmit` handler with a call to `actions.updateProfile({ name, description, hobbies, birthdate })`
- [x] 2.2 Add success/error feedback after the profile update (e.g., status signal or toast)

## 3. Implement Picture Upload

- [x] 3.1 In `onSubmit`, check if the picture field value is a File object (new upload) vs a string (existing path)
- [x] 3.2 If it's a File, extract the path via `(file as any).path` and call `actions.updateProfilePicture(filePath)`
- [x] 3.3 Include the returned `picturePath` in the profile update payload (or skip if no new picture was selected)

## 4. Cleanup

- [x] 4.1 Remove the commented-out code block at the bottom of the file (lines 183-210)
