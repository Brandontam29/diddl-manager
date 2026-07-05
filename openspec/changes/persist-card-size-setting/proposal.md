## Why

The card size setting in SettingsSectionUx is stored only in an in-memory SolidJS store (`legacy-index.ts`). When the app restarts, the selection resets to the default "Medium". The backend already has a `cardSize` field in the persisted UI state (`ui-state-schema.ts`) and tRPC endpoints to read/write it, but the renderer never calls them.

## What Changes

- Wire `SettingsSectionUx` to read the persisted `cardSize` from the backend UI state instead of the in-memory store.
- On card size change, call the existing `updateUiState` tRPC mutation to persist the new value.
- Derive `cardHeight` from the persisted `cardSize` so card rendering still works.
- Remove dependency on the legacy in-memory store for card size.

## Capabilities

### New Capabilities

- `persist-card-size`: Read and write the card size preference through the existing UI state persistence layer, replacing the in-memory-only store.

### Modified Capabilities

(none)

## Impact

- **Renderer**: `SettingsSectionUx.tsx` switches from importing `legacy-index.ts` to using the UI state feature (`use-ui-state.ts` / `updateUiStateAction`).
- **Renderer**: Any component reading `uiStore.cardHeight` from `legacy-index.ts` must be updated to derive height from the persisted `cardSize`.
- **Main process**: No changes needed -- `configRouter.updateUiState` and `ui-state-schema.cardSize` already exist.
