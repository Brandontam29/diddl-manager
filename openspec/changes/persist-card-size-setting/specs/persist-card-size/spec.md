## ADDED Requirements

### Requirement: Card size selection is persisted to disk

When the user changes the card size in settings, the system SHALL persist the selected zoom level (`sm`, `md`, `lg`, `xl`) to the UI state store via the `updateUiState` tRPC mutation with key `cardSize`.

#### Scenario: User changes card size

- **WHEN** the user selects a new card size (e.g., "Large") in the settings UI
- **THEN** the system calls `updateUiState` with `{ keyPath: ["cardSize"], value: "lg" }` and the value is written to the UI state JSON file

#### Scenario: Card size survives app restart

- **WHEN** the user sets card size to "Small", closes the app, and reopens it
- **THEN** the settings dropdown SHALL show "Small" and cards SHALL render at 215px height

### Requirement: Card height is derived from persisted card size

All components that render cards or card skeletons SHALL derive their pixel height from the persisted `cardSize` value using the `ZOOM_HEIGHT_MAP` lookup (`sm`=215, `md`=240, `lg`=280, `xl`=320).

#### Scenario: Cards render at persisted size

- **WHEN** the persisted `cardSize` is `"xl"`
- **THEN** `DiddlCards` and `FallbackLoadingDiddl` SHALL use a card height of 320px

#### Scenario: Default size before state loads

- **WHEN** the UI state has not yet loaded (async fetch in progress)
- **THEN** components SHALL default to `"md"` (240px height)

### Requirement: Settings UI reads from persisted state

The card size dropdown in both `SettingsSectionUx` and `SettingsDialog` SHALL read the current value from the persisted UI state, not from an in-memory-only store.

#### Scenario: Settings dropdown reflects persisted value

- **WHEN** the user opens settings and the persisted `cardSize` is `"lg"`
- **THEN** the dropdown SHALL show "Large" as the selected option
