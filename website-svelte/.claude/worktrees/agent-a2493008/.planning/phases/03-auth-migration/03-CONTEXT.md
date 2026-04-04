# Phase 3: Auth + Migration - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can sign in with Clerk and have their guest data migrated to Convex automatically, with list behavior identical to guest mode. This phase delivers: Clerk sign-in/sign-up via modal, ConvexListStore backed by authed functions, idempotent guest-to-Convex migration, and a landing page at `/`. Guest mode continues to work unchanged.

</domain>

<decisions>
## Implementation Decisions

### Sign-in UI

- **D-01:** Sign-in uses a header button that opens Clerk's built-in modal overlay. No dedicated /login page or route needed.
- **D-02:** Auth providers: Email + password and Google OAuth. Configured in Clerk dashboard.
- **D-03:** Clerk modal is themed to match the app (stone theme, dark mode colors). Not default Clerk styling.
- **D-04:** Landing page at `/` with a brief pitch for Diddl Manager, "Try as Guest" and "Sign In" buttons. First impression before entering `/app`.
- **D-05:** Sign-out redirects to home/landing page (`/`), not back to `/app` as guest.

### Store Switching

- **D-06:** Seamless swap in place — after sign-in, the store switches from GuestListStore to ConvexListStore on the same page. No redirect, no full page reload. Brief loading shimmer during transition.
- **D-07:** Auto-migrate silently — guest data migrates to Convex automatically on first sign-in. No confirmation dialog.
- **D-08:** Merge on conflict — if a returning user signs in and has both Convex lists and a guest list in localStorage, the guest list is added as an additional list. Items already in a Convex list are deduplicated.

### Migration Feedback

- **D-09:** Loading shimmer on the list area while migration runs (1-2 seconds). Once complete, success toast: "Your collection has been saved to your account."
- **D-10:** On failure: error toast "Could not save collection. Retrying..." with auto-retry up to 3 times with backoff. If all retries fail: "Data safe in browser. We'll try again next time." localStorage is NOT cleared on failure.
- **D-11:** Migration retries on next sign-in if previous attempt failed (localStorage preserved = data available for retry).

### Guest vs Authed Navigation

- **D-12:** Header: guests see "Sign In" button; signed-in users see Clerk UserButton avatar with dropdown (Profile link, Sign out).
- **D-13:** Subtle contextual upgrade prompts at friction points: when guest tries to create a 2nd list ("Sign up to create more lists") and on the lists page footer ("Sign up to sync across devices"). Non-blocking.
- **D-14:** Same nav structure for guests and authed (Catalog + Lists). Profile link only for authed users.
- **D-15:** Authed users capped at 3 lists. Guest limit remains 1 list (from Phase 2, D-05).
- **D-16:** Completion percentage per type in the sidebar is visible only to authed users, not guests.

### Carried Forward from Phase 2

- **CF-01:** ListStore abstract interface — ConvexListStore implements same contract as GuestListStore (Phase 2, D-19)
- **CF-02:** Guest data uses natural keys (type:number); migration mapper transforms to Convex shape (Phase 2, D-20)
- **CF-03:** Migration idempotency key is guestSessionId; localStorage cleared only after Convex action confirms success (STATE.md)

### Claude's Discretion

- Loading shimmer component design and animation
- Exact toast message wording
- Retry backoff timing (e.g., 1s, 2s, 4s)
- Landing page layout and copy details
- Clerk theme color mapping specifics

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Auth Infrastructure (existing)

- `src/lib/stores/clerk.svelte.ts` — ClerkStore with reactive user/session state, Clerk initialization with `afterSignOutUrl`/`signInForceRedirectUrl` settings
- `src/lib/wrappers/ClerkWrapper.svelte` — Clerk initialization wrapper, shows loading state until Clerk is loaded
- `src/lib/wrappers/ConvexWrapper.svelte` — Convex client setup, already calls `convex.setAuth(getClerkAuthToken)` for JWT auth
- `src/convex/auth.config.ts` — Clerk JWT issuer configuration for Convex

### ListStore Interface (existing)

- `src/lib/lists/listTypes.ts` — ListStore interface, GuestList/GuestListItem types, CatalogReference, condition types, factory functions
- `src/lib/lists/listStore.svelte.ts` — GuestListStore implementation (localStorage, Svelte 5 runes, auto-save)
- `src/lib/lists/listStoreContext.svelte.ts` — Context-based store provider (getListStoreContext/setListStoreContext)

### App Layout (existing)

- `src/routes/app/+layout.svelte` — Currently creates GuestListStore and sets context; will need to conditionally create ConvexListStore for authed users

### Convex Function Patterns

- `src/convex/authed/helpers.ts` — authedQuery/authedMutation wrappers for client-facing functions (ConvexListStore will use these)
- `src/convex/private/helpers.ts` — privateAction wrappers for backend-only functions
- `src/convex/schema.ts` — Existing schema with lists/listItems tables

### State & Decisions

- `.planning/STATE.md` — Notes on guestSessionId idempotency mechanism and migration coordination
- `.planning/phases/02-guest-list-mode/02-CONTEXT.md` — Phase 2 decisions on ListStore interface, localStorage shape, guest limit

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `ClerkStore` — Already has reactive `currentUser`/`currentSession`, Clerk `addListener` for state changes. Can detect sign-in/sign-out transitions.
- `ClerkWrapper` / `ConvexWrapper` — Already wired in app layout. Convex auth token flow is complete.
- `ListStore` interface — Full contract defined with all CRUD methods, selectors, and completion helpers. ConvexListStore must implement this exactly.
- `GuestListStore` — Reference implementation showing the expected reactive behavior (Svelte 5 runes, auto-save pattern).
- `listStoreContext` — Context provider pattern ready for swapping implementations.
- shadcn-svelte components — Badge, Card, Accordion, Dialog, Sonner (toast) already installed.

### Established Patterns

- Svelte 5 runes (`$state`, `$derived`, `$effect`) for all reactive state
- Convex `useQuery()` for reactive data fetching — ConvexListStore will use this for real-time list data
- `authedQuery` / `authedMutation` wrappers for client-facing Convex functions with Clerk JWT validation
- Effect v4 for backend service composition (ConvexPrivateService, ClerkService)
- Context-based store with getter/setter functions

### Integration Points

- `src/routes/app/+layout.svelte` — Must switch from always-GuestListStore to conditional store based on auth state
- `src/routes/+page.svelte` — Currently a demo page, will become the landing page
- Header component — Needs Sign In button / UserButton swap based on auth state
- `src/convex/authed/` — New list queries/mutations for ConvexListStore
- Migration action — New Convex action to receive guest data and write to user's lists

</code_context>

<specifics>
## Specific Ideas

- Header swaps between "Sign In" button (guest) and Clerk UserButton avatar (authed)
- Clerk modal themed to stone/dark to match app aesthetic
- Landing page at `/` with app pitch + "Try as Guest" + "Sign In" CTAs
- Migration is invisible to the user except for a brief shimmer and success toast
- Guest list auto-merges into account even if user already has Convex lists (dedup items)
- Contextual sign-up prompts at natural friction points (2nd list attempt, lists page footer)
- Completion percentages gated to authed users only as a sign-up incentive
- 3 list cap for authed users

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 03-auth-migration_
_Context gathered: 2026-04-03_
