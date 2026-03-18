## ADDED Requirements

### Requirement: User can activate list comparison mode
The system SHALL provide a "Compare with List" control on the home page that allows the user to select a list for visual comparison against the full diddl catalog.

#### Scenario: User activates comparison mode
- **WHEN** user clicks the "Compare with List" button on the home page
- **THEN** a popover SHALL display all available (non-deleted) lists

#### Scenario: User selects a list from the popover
- **WHEN** user selects a list from the comparison popover
- **THEN** the system SHALL enter diff mode with that list as the comparison target
- **THEN** the popover SHALL close

### Requirement: Cards not in the selected list are visually de-emphasized
The system SHALL apply a grayed-out visual treatment (reduced opacity and grayscale filter) to diddl cards on the home page that are NOT present in the selected comparison list.

#### Scenario: Card is not in the selected list
- **WHEN** diff mode is active with a selected list
- **AND** a diddl card's ID is not present in any list item of the selected list
- **THEN** the card SHALL be displayed with reduced opacity (40%) and a grayscale CSS filter

#### Scenario: Card is in the selected list
- **WHEN** diff mode is active with a selected list
- **AND** a diddl card's ID matches a list item's diddlId in the selected list
- **THEN** the card SHALL be displayed with normal styling (no opacity reduction, no grayscale)

### Requirement: User can dismiss comparison mode
The system SHALL provide a way to exit diff mode and return all cards to their normal visual state.

#### Scenario: User dismisses comparison mode
- **WHEN** diff mode is active
- **AND** user clicks the dismiss/clear button
- **THEN** all cards SHALL return to normal visual styling
- **THEN** the `diffListId` state SHALL be set to null

#### Scenario: Navigation clears comparison mode
- **WHEN** diff mode is active
- **AND** user navigates to a different page or changes URL parameters
- **THEN** diff mode SHALL be automatically deactivated

### Requirement: Comparison mode coexists with selection mode
The system SHALL allow card selection to function normally while diff mode is active.

#### Scenario: Selecting a grayed-out card
- **WHEN** diff mode is active
- **AND** user clicks to select a card that is grayed out (not in the comparison list)
- **THEN** the card SHALL be added to selectedIndices as normal
- **THEN** the selection visual indicators (blue border, checkmark) SHALL be visible on the card

#### Scenario: Taskbar appears during diff mode
- **WHEN** diff mode is active
- **AND** user has selected one or more cards
- **THEN** the Taskbar SHALL appear as normal with all standard actions available
