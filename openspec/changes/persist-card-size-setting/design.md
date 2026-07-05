## Context

Card size is currently stored in a SolidJS in-memory store (`legacy-index.ts`). The backend already persists a `cardSize` field (as a zoom level key: `sm`/`md`/`lg`/`xl`) in the UI state JSON file via `electron-store`, and exposes `getUiState`/`updateUiState` tRPC endpoints. The renderer already has `useUiState()` and `updateUiStateAction` wired up in `features/ui-state/`. The gap is that `SettingsSectionUx` and card-rendering components read from the legacy in-memory store instead of the persisted state.

Consumers of `uiStore.cardHeight`:

- `SettingsSectionUx.tsx` -- settings dropdown
- `SettingsDialog.tsx` -- duplicate settings dropdown (same pattern)
- `DiddlCards.tsx` -- card rendering dimensions
- `FallbackLoadingDiddl.tsx` -- loading skeleton dimensions

## Goals / Non-Goals

**Goals:**

- Card size selection persists across app restarts.
- All consumers derive card height from the persisted `cardSize` value.
- Reuse the existing `updateUiStateAction` / `useUiState` pattern on the renderer side.

**Non-Goals:**

- Removing `legacy-index.ts` entirely (other state may still live there).
- Changing the zoom level values or adding new sizes.
- Migrating other UI state fields in this change.

## Decisions

**1. Keep the `ZOOM_HEIGHT_MAP` as the single source of truth for size-to-pixel mapping.**
The shared schema (`ui-state-schema.ts`) already exports `ZOOM_HEIGHT_MAP`. Both renderer and main process can import it. No duplication needed.

**2. Derive `cardHeight` from persisted `cardSize` on the renderer via a helper/accessor.**
Create a derived accessor (e.g., `cardHeight()`) that reads `uiState()?.cardSize` and maps it through `ZOOM_HEIGHT_MAP`. Consumers replace `uiStore.cardHeight` with this accessor.

**3. Use `updateUiStateAction` for writes, matching the existing `useWindowTracking` pattern.**
`SettingsSectionUx` will call `updateUiStateAction({ cardSize: "lg" })` on change. This follows the same approach already established for `windowBounds`.

## Risks / Trade-offs

- **[Async load flicker]** The persisted state loads asynchronously, so `cardSize` may be `undefined` briefly on startup. Mitigation: default to `"md"` (240px) when the value hasn't loaded yet, matching the current hardcoded default.
- **[Two settings dialogs]** `SettingsDialog.tsx` has a duplicate card-size dropdown. Both must be updated. Mitigation: listed explicitly in tasks.
