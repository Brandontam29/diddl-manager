## 1. Fix UserProvider reactive primitive

- [ ] 1.1 Replace `createAsync` import with `createResource` from `solid-js` in `profile-state.tsx`
- [ ] 1.2 Replace `createAsync(() => fetchProfile())` with `createResource` using a direct IPC fetcher (bypass the router `query` wrapper)
- [ ] 1.3 Update `UserContextValue` type: change `profile` from `Resource<Profile | null | undefined>` to `Resource<Profile | null>` (matching `createResource` return type)

## 2. Fix refetch mechanism

- [ ] 2.1 Store the `refetch` function from `createResource`'s return tuple
- [ ] 2.2 Update `updateProfile` and `updateProfilePicture` actions to call `refetch()` instead of `revalidate("profile")`
- [ ] 2.3 Update `refetchProfile` export to use the resource's `refetch` function

## 3. Cleanup

- [ ] 3.1 Remove unused imports (`query`, `createAsync`, `revalidate` from `@solidjs/router`) if no longer needed
- [ ] 3.2 Remove the `fetchProfile` query wrapper if replaced by a plain async function

## 4. Verify

- [ ] 4.1 Confirm the app compiles without type errors
- [ ] 4.2 Confirm profile loads correctly on app startup
