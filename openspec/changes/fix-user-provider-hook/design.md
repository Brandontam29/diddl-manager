## Context

`UserProvider` currently uses `createAsync()` from `@solidjs/router` to fetch the user profile. This primitive depends on being within a router context. When `UserProvider` is mounted above the `<Router>` in `main.tsx`, `createAsync` fails because no router context exists yet. Additionally, the `UserContextValue` type declares `profile` as `Resource<Profile | null | undefined>`, but `createAsync` returns an `Accessor<T | undefined>`, creating a type mismatch.

## Goals / Non-Goals

**Goals:**
- Make `UserProvider` work correctly when mounted above the router
- Use the correct SolidJS primitive and types for async data fetching
- Maintain the same refetch/revalidation behavior for profile data

**Non-Goals:**
- Changing how profile data is fetched from the main process (IPC layer stays the same)
- Refactoring other features or components beyond what's needed for the fix

## Decisions

### Use `createResource` instead of `createAsync`

**Choice**: Replace `createAsync(() => fetchProfile())` with `createResource(fetcher)` from `solid-js`.

**Rationale**: `createResource` is a core SolidJS primitive with no dependency on router context. It provides the same reactive async data pattern but works anywhere in the component tree. It also returns a proper `Resource` type, matching the existing `UserContextValue` type declaration.

**Alternative considered**: Moving `UserProvider` below the `<Router>` — rejected because the user context is logically app-level and should not depend on routing infrastructure.

### Refetch via resource refetch function

**Choice**: Use the `refetch` function returned by `createResource` instead of `revalidate("profile")` from the router.

**Rationale**: Since we're no longer using the router's query/cache system for the profile, `revalidate` won't trigger a refetch. `createResource` returns a `[resource, { refetch }]` tuple that provides this directly.

## Risks / Trade-offs

- **[Loss of router cache deduplication]** → Acceptable. Profile is fetched once at the app level via context; there's no duplicate fetching concern.
- **[refetchProfile callers]** → `refetchProfile` is called from `updateProfile` and `updateProfilePicture` actions. These need to be updated to call the resource's `refetch` instead of `revalidate`. Since they're all in the same file, this is straightforward.
