## 1. Renderer: Card Size Accessor

- [x] 1.1 In `features/ui-state/`, export a derived accessor `cardHeight()` that reads `useUiState()` → `cardSize` and maps it through `ZOOM_HEIGHT_MAP`, defaulting to `"md"` (240px) when state hasn't loaded
- [x] 1.2 Export the `ZOOM_HEIGHT_MAP` and `HEIGHT_ZOOM_MAP` lookups from the shared schema so renderer components can import them (verify already accessible via `@shared`)

## 2. Settings UI: Persist on Change

- [x] 2.1 Update `SettingsSectionUx.tsx` to read `cardSize` from `useUiState()` instead of `uiStore.cardHeight` from `legacy-index`, and derive the selected dropdown option from the persisted value
- [x] 2.2 Update `SettingsSectionUx.tsx` onChange to call `updateUiStateAction({ cardSize: value })` instead of `setCardZoomLevel`
- [x] 2.3 Update `SettingsDialog.tsx` with the same read/write changes as 2.1 and 2.2

## 3. Card Rendering: Read from Persisted State

- [x] 3.1 Update `DiddlCards.tsx` to use the new `cardHeight()` accessor instead of `uiStore.cardHeight`
- [x] 3.2 Update `FallbackLoadingDiddl.tsx` to use the new `cardHeight()` accessor instead of `uiStore.cardHeight`

## 4. Cleanup

- [x] 4.1 Remove `cardHeight`, `setCardZoomLevel`, `ZOOM_LEVEL_MAP`, and `HEIGHT_ZOOM_MAP` exports from `legacy-index.ts` (verify no remaining consumers first)
