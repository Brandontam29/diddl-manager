## ADDED Requirements

### Requirement: Max-width Container
The `ListsPage` SHALL include a container that restricts the maximum width of the content and centers it on the screen.

#### Scenario: Large screen layout
- **WHEN** the browser window is larger than 1280px (e.g., 7xl)
- **THEN** the content should not exceed the max width and should be centered.

### Requirement: Responsive Grid
The `ListsPage` SHALL use a responsive grid layout that adapts the number of columns based on the viewport width.

#### Scenario: Narrow viewport
- **WHEN** the browser window is narrow (e.g., mobile)
- **THEN** the grid should display 1 column of cards.

#### Scenario: Wide viewport
- **WHEN** the browser window is wide (e.g., desktop)
- **THEN** the grid should display multiple columns (e.g., 3 or 4) of cards.

### Requirement: Uniform Card Size
All list cards in the `ListsPage` grid SHALL have a uniform height within each row, regardless of their content.

#### Scenario: Inconsistent content length
- **WHEN** two list cards in the same row have different name lengths
- **THEN** both cards should have the same height.
