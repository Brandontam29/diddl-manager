## Why

`UserProvider` uses `createAsync()` from `@solidjs/router` which requires a router context to function. When `UserProvider` wraps the app at the top level (above the router), `createAsync` fails because it's called outside the router's reactive scope. The context type also incorrectly declares `profile` as `Resource<Profile | null | undefined>` when `createAsync` returns an `Accessor<T | undefined>`.

## What Changes

- Replace `createAsync()` in `UserProvider` with a SolidJS primitive (`createResource`) that doesn't depend on the router context
- Fix the `UserContextValue` type to match the actual return type of the reactive primitive used
- Update `refetchProfile` to use the resource's refetch mechanism instead of `revalidate()`

## Capabilities

### New Capabilities

_None — this is a bug fix to existing functionality._

### Modified Capabilities

_None — no spec-level behavior changes, only an implementation fix._

## Impact

- `src/renderer/src/features/profile/profile-state.tsx` — primary file being modified
- Components consuming `useProfile()` may need minor type adjustments if they depend on `Resource` methods (e.g., `.loading`)
- No API or dependency changes
