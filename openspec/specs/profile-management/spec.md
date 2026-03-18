### Requirement: User can view profile
The system SHALL display the user's current profile information including name, birthdate, description, hobbies, and profile picture.

#### Scenario: Profile data exists
- **WHEN** the user navigates to the profile section
- **THEN** the system displays the user's name, birthdate, description, hobbies, and picture.

### Requirement: User can edit profile details
The system SHALL allow the user to modify their name, birthdate, description, and hobbies, and save the changes.

#### Scenario: Successful profile update
- **WHEN** the user submits modified profile details
- **THEN** the system updates the profile in the database and reflects the changes in the UI.

### Requirement: User can update profile picture
The system SHALL allow the user to select and upload a new profile picture.

#### Scenario: Successful picture upload
- **WHEN** the user selects a valid image file for their profile picture
- **THEN** the system saves the image and updates the displayed profile picture.