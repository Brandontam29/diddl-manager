## MODIFIED Requirements

### Requirement: User can edit profile details
The system SHALL allow the user to modify their name, birthdate, description, and hobbies from the settings page profile form, and save the changes via IPC to the backend database. The form SHALL use the `useProfile()` context to access profile data and submit actions.

#### Scenario: Successful profile update
- **WHEN** the user submits modified profile details from the settings profile form
- **THEN** the system SHALL call the `updateProfile` IPC handler, persist the changes in the database, refetch the profile resource, and reflect the changes in the UI

### Requirement: User can update profile picture
The system SHALL allow the user to select and upload a new profile picture from the settings profile form. The upload SHALL use the Electron `File.path` property to send the local file path to the backend via the `updateProfilePicture` IPC handler.

#### Scenario: Successful picture upload
- **WHEN** the user selects a valid image file for their profile picture and submits the form
- **THEN** the system SHALL copy the image to the user images directory via IPC, update the profile's `picturePath` with the stored path, and display the new profile picture
