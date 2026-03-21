## ADDED Requirements

### Requirement: Form submission saves profile to backend
The settings profile form SHALL call the backend `updateProfile` IPC handler with the form field values (name, description, hobbies, birthdate) when the user submits the form.

#### Scenario: Successful profile save
- **WHEN** the user fills in valid form fields and clicks "Save Profile"
- **THEN** the system SHALL call `updateProfile()` with `{ name, description, hobbies, birthdate }` and the profile resource SHALL be refetched

#### Scenario: Profile save with partial fields
- **WHEN** the user submits the form with some optional fields empty
- **THEN** the system SHALL send the empty strings for those fields and the backend SHALL accept the partial update

### Requirement: Profile picture upload sends file to backend
The settings profile form SHALL upload the selected image file to the backend via the `updateProfilePicture` IPC handler, using the Electron `File.path` property, and include the returned stored path in the profile update.

#### Scenario: User selects a new profile picture and saves
- **WHEN** the user selects an image file and submits the form
- **THEN** the system SHALL extract the file path from the Electron File object, call `updateProfilePicture(filePath)`, and then call `updateProfile()` with `picturePath` set to the returned stored path

#### Scenario: User submits without changing profile picture
- **WHEN** the user submits the form without selecting a new image file
- **THEN** the system SHALL NOT call `updateProfilePicture` and SHALL leave `picturePath` unchanged in the profile update

### Requirement: Form loads profile data from UserProvider context
The `SettingsSectionProfile` component SHALL access the current profile data via the `useProfile()` context hook to populate form default values.

#### Scenario: Form loads with existing profile data
- **WHEN** the settings profile form mounts
- **THEN** the form fields SHALL be populated with the current profile values from the `useProfile()` resource

### Requirement: User feedback on save result
The form SHALL provide feedback to the user on whether the save succeeded or failed.

#### Scenario: Save succeeds
- **WHEN** the profile update completes successfully
- **THEN** the form SHALL indicate success (e.g., button text change or notification)

#### Scenario: Save fails
- **WHEN** the profile update fails
- **THEN** the form SHALL display an error indication to the user
