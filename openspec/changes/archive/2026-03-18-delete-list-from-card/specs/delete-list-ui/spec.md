## ADDED Requirements

### Requirement: Delete button on list card
Each list card on the lists overview page SHALL display an X (close) button in the top-right corner.

#### Scenario: Delete button is visible
- **WHEN** the lists overview page is displayed with one or more lists
- **THEN** each list card MUST show an X button in the top-right corner

#### Scenario: Delete button does not navigate
- **WHEN** the user clicks the X button on a list card
- **THEN** the app MUST NOT navigate to the list detail page

### Requirement: Delete confirmation
Clicking the delete button SHALL show a confirmation dialog before deleting the list.

#### Scenario: Confirmation dialog shown
- **WHEN** the user clicks the X button on a list card
- **THEN** a confirmation dialog MUST appear asking the user to confirm deletion

#### Scenario: User confirms deletion
- **WHEN** the user confirms the deletion in the dialog
- **THEN** the system MUST call the delete list API with the list's ID
- **THEN** the list MUST be removed from the displayed grid

#### Scenario: User cancels deletion
- **WHEN** the user cancels the deletion in the dialog
- **THEN** the list MUST remain unchanged in the grid
- **THEN** no API call MUST be made

### Requirement: List grid updates after deletion
After a list is successfully deleted, the lists grid SHALL refresh to reflect the removal.

#### Scenario: Grid refreshes after delete
- **WHEN** a list is successfully deleted
- **THEN** the lists cache MUST be revalidated
- **THEN** the deleted list MUST no longer appear in the grid
