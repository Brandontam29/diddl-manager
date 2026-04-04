# Phase 3: Auth + Migration - Research

**Researched:** 2026-04-03
**Domain:** Clerk authentication, Convex authed functions, guest-to-Convex data migration, store switching
**Confidence:** HIGH

## Summary

Phase 3 wires Clerk authentication into the existing app, builds a ConvexListStore that implements the same ListStore interface as GuestListStore, creates a Convex action for idempotent guest-to-Convex migration, and adds a landing page at `/`. The infrastructure is heavily pre-built: ClerkStore with reactive user/session state, ClerkWrapper/ConvexWrapper already in the app layout, authedQuery/authedMutation wrappers, Convex schema with lists/listItems tables, and the full ListStore interface contract.

The core technical challenge is the **store switching flow**: detecting auth state change, running migration, and swapping from GuestListStore to ConvexListStore without a page reload. The Convex schema already has `lists` and `listItems` tables with `ownerSubject` indexing, so the authed functions are straightforward CRUD. The migration action must resolve guest natural keys (type:number) to Convex catalogItem IDs, deduplicate against existing user data, and use guestSessionId for idempotency.

**Primary recommendation:** Build ConvexListStore as a reactive wrapper around `useQuery()` subscriptions and `useConvexClient().mutation()` calls, implementing the exact ListStore interface. Migration runs as a single Convex action that receives the full guest payload, resolves catalog references, and writes lists/items transactionally.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Sign-in uses a header button that opens Clerk's built-in modal overlay. No dedicated /login page or route needed.
- **D-02:** Auth providers: Email + password and Google OAuth. Configured in Clerk dashboard.
- **D-03:** Clerk modal is themed to match the app (stone theme, dark mode colors). Not default Clerk styling.
- **D-04:** Landing page at `/` with a brief pitch for Diddl Manager, "Try as Guest" and "Sign In" buttons.
- **D-05:** Sign-out redirects to home/landing page (`/`), not back to `/app` as guest.
- **D-06:** Seamless swap in place -- after sign-in, the store switches from GuestListStore to ConvexListStore on the same page. No redirect, no full page reload. Brief loading shimmer during transition.
- **D-07:** Auto-migrate silently -- guest data migrates to Convex automatically on first sign-in. No confirmation dialog.
- **D-08:** Merge on conflict -- if a returning user signs in and has both Convex lists and a guest list in localStorage, the guest list is added as an additional list. Items already in a Convex list are deduplicated.
- **D-09:** Loading shimmer on the list area while migration runs (1-2 seconds). Once complete, success toast.
- **D-10:** On failure: error toast with auto-retry up to 3 times with backoff. If all retries fail: "Data safe in browser. We'll try again next time." localStorage is NOT cleared on failure.
- **D-11:** Migration retries on next sign-in if previous attempt failed (localStorage preserved = data available for retry).
- **D-12:** Header: guests see "Sign In" button; signed-in users see Clerk UserButton avatar with dropdown.
- **D-13:** Subtle contextual upgrade prompts at friction points (2nd list attempt, lists page footer).
- **D-14:** Same nav structure for guests and authed (Catalog + Lists). Profile link only for authed users.
- **D-15:** Authed users capped at 3 lists. Guest limit remains 1 list.
- **D-16:** Completion percentage per type in the sidebar is visible only to authed users, not guests.
- **CF-01:** ListStore abstract interface -- ConvexListStore implements same contract as GuestListStore.
- **CF-02:** Guest data uses natural keys (type:number); migration mapper transforms to Convex shape.
- **CF-03:** Migration idempotency key is guestSessionId; localStorage cleared only after Convex action confirms success.

### Claude's Discretion
- Loading shimmer component design and animation
- Exact toast message wording
- Retry backoff timing (e.g., 1s, 2s, 4s)
- Landing page layout and copy details
- Clerk theme color mapping specifics

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | User can sign up and log in via Clerk | Clerk JS 6.3.0 `openSignIn()`/`openSignUp()` modal API; `mountUserButton()` for authed header; appearance theming via `clerk.load({ appearance })` |
| AUTH-02 | User can use the app without logging in (guest mode with full trial) | GuestListStore already works; conditional store creation in app layout; catalog queries use plain `query()` not `authedQuery` |
| AUTH-03 | Guest data is stored in localStorage with the same data model as Convex | Already implemented in Phase 2; `STORAGE_KEY = 'diddl-guest-data'`; natural keys (type:number) for catalog refs |
| AUTH-04 | Guest data migrates to Convex on first sign-in (idempotent migration) | Convex action receives guest payload + guestSessionId; resolves natural keys to catalogItem IDs via `by_type_number` index; dedup via `by_list_catalog` index; idempotency via guestSessionId check |
| AUTH-05 | User session persists across browser refresh | Clerk JS handles session persistence via cookies/tokens; ConvexWrapper already calls `convex.setAuth(getClerkAuthToken)` |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @clerk/clerk-js | 6.3.0 | Authentication modal, UserButton, session management | Already in project, handles JWT issuance for Convex |
| @clerk/ui | (bundled) | Clerk component rendering engine | Already loaded in ClerkStore constructor |
| convex | 1.33.0 | Backend functions, real-time subscriptions | Already in project, schema with lists/listItems ready |
| convex-svelte | 0.0.12 | Reactive `useQuery()` and `useConvexClient()` | Already in project, used by catalog pages |
| convex-helpers | 0.1.114 | `customQuery`/`customMutation`/`customAction` wrappers | Already in project, powers authed/private patterns |
| svelte-sonner | (installed) | Toast notifications for migration feedback | Already in project, used by GuestListStore |

### Optional (May Need Install)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @clerk/themes | 2.4.x | Prebuilt Clerk theme variables | Only if custom appearance variables are insufficient; likely NOT needed since manual variable mapping works |

**Installation:** No new packages required. All dependencies are already installed.

## Architecture Patterns

### ConvexListStore: Reactive Wrapper Pattern

The ConvexListStore must implement the exact `ListStore` interface from `listTypes.ts`. It wraps Convex reactive queries for reads and `useConvexClient().mutation()` calls for writes.

**Key difference from GuestListStore:** GuestListStore manages state internally with `$state()`. ConvexListStore delegates state to Convex via `useQuery()` subscriptions that auto-update when data changes server-side.

```typescript
// Pattern: ConvexListStore reads from useQuery(), writes via client.mutation()
// Source: Existing codebase patterns in catalog/+page.svelte and references/+page.svelte

import { useQuery, useConvexClient } from 'convex-svelte';
import { api } from '../../convex/_generated/api';
import type { ListStore, GuestList, GuestListItem } from './listTypes';

export function createConvexListStore(ownerSubject: string): ListStore {
  const client = useConvexClient();

  // Reactive queries -- auto-update when Convex data changes
  const listsQuery = useQuery(api.authed.lists.listByOwner, {});
  const activeItemsQuery = useQuery(api.authed.listItems.byList, () =>
    activeListId ? { listId: activeListId } : 'skip'
  );

  let activeListId = $state<string | null>(null);

  return {
    get lists() {
      // Map Convex docs to GuestList shape for interface compat
      return (listsQuery.data ?? []).map(mapConvexListToGuestList);
    },
    get activeListId() { return activeListId; },
    get activeListItems() {
      return (activeItemsQuery.data ?? []).map(mapConvexItemToGuestListItem);
    },

    async createList(name, color) {
      const id = await client.mutation(api.authed.lists.create, { name, color });
      // ... return mapped list
    },
    // ... other methods follow same pattern
  };
}
```

**Critical design note:** The `ListStore` interface methods like `createList()` return `GuestList` synchronously in GuestListStore but will need to be async in ConvexListStore (mutation returns a promise). The interface may need slight adjustment to return `GuestList | Promise<GuestList>`, OR ConvexListStore can optimistically update local state and let `useQuery()` reconcile.

### Migration Action Pattern

The migration runs as a single Convex `authedAction` that:
1. Receives the full guest data payload (lists + items + guestSessionId)
2. Checks if guestSessionId was already migrated (idempotency)
3. Resolves natural keys (type:number) to catalogItem IDs via the `by_type_number` index
4. Creates lists with `ownerSubject` from the authenticated identity
5. Creates list items, deduplicating against existing items via `by_list_catalog` index
6. Records the guestSessionId as migrated

```typescript
// Pattern: Migration action receives guest data, writes to Convex transactionally
// Source: Convex docs on actions + existing authedAction wrapper

export const migrateGuestData = authedAction({
  args: {
    guestSessionId: v.string(),
    lists: v.array(v.object({
      id: v.string(),       // guest UUID
      name: v.string(),
      color: v.string(),
    })),
    items: v.array(v.object({
      listId: v.string(),   // guest list UUID
      type: v.string(),     // natural key part 1
      number: v.number(),   // natural key part 2
      condition: v.union(/* ... */),
      quantity: v.number(),
      complete: v.boolean(),
      tags: v.array(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const ownerSubject = ctx.identity.subject;

    // 1. Idempotency check
    // 2. Resolve type:number -> catalogItemId via db.query + by_type_number index
    // 3. Create lists, map guest list UUIDs -> Convex list IDs
    // 4. Create items with dedup
    // 5. Record migration complete
  }
});
```

**Important:** Convex actions can call mutations internally via `ctx.runMutation()`. For transactional writes, the action should delegate to an internal mutation that handles all inserts atomically.

### Store Switching in App Layout

The app layout (`src/routes/app/+layout.svelte`) must conditionally create the store based on auth state:

```svelte
<!-- Pattern: Conditional store creation based on Clerk auth state -->
<script lang="ts">
  import { getClerkContext } from '$lib/stores/clerk.svelte';

  const clerkContext = getClerkContext();
  const isAuthed = $derived(clerkContext.currentUser !== null);

  // When auth state changes:
  // 1. If signed in: run migration (if guest data exists), create ConvexListStore
  // 2. If signed out: create GuestListStore
  // Store is set via setListStoreContext()
</script>
```

The tricky part is **reactively switching** the store when auth state changes mid-session (user signs in while on `/app`). This requires an `$effect()` that watches `clerkContext.currentUser` and swaps the context.

### Recommended Project Structure (New Files)

```
src/
  convex/
    authed/
      lists.ts              # Authed CRUD for lists (query, create, update, delete)
      listItems.ts          # Authed CRUD for list items (query, add, remove, update, duplicate)
      migration.ts          # Authed action for guest data migration
  lib/
    lists/
      convexListStore.svelte.ts  # ConvexListStore implementation
      migration.ts               # Client-side migration orchestrator (retry logic, toast feedback)
  components/
    landing/
      LandingHeader.svelte       # Simplified header for / page
      FeatureCard.svelte         # Landing page feature card
    layout/
      AppHeader.svelte           # Shared header for /app pages (Sign In / UserButton)
      ShimmerGrid.svelte         # Loading shimmer placeholder
      UpgradePrompt.svelte       # Contextual sign-up prompt
  routes/
    +page.svelte                 # Landing page (replace demo page)
    app/
      +layout.svelte             # Updated: conditional store switching
```

### Anti-Patterns to Avoid
- **Do NOT create a separate /login route.** Clerk modal handles sign-in/sign-up entirely (D-01).
- **Do NOT clear localStorage before migration confirms success.** This is the #1 data loss risk (CF-03).
- **Do NOT use `authedQuery` for catalog queries.** They must remain accessible to guests (AUTH-02). Catalog queries use plain `query()`.
- **Do NOT redirect after sign-in.** Store switches in-place on the same page (D-06).
- **Do NOT build a custom auth state manager.** ClerkStore already has reactive `currentUser`/`currentSession` via Clerk's `addListener`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth modal UI | Custom login form | `clerk.openSignIn()` / `clerk.openSignUp()` | Clerk handles OAuth, email verification, MFA, session tokens |
| User avatar dropdown | Custom dropdown component | `clerk.mountUserButton(el)` | Clerk handles profile, sign-out, session management |
| JWT token management | Custom token refresh | `convex.setAuth(getClerkAuthToken)` | ConvexWrapper already wires this; Clerk handles token refresh |
| Session persistence | Custom cookie/localStorage auth | Clerk cookies + Convex auth config | Clerk JS handles session across refreshes automatically |
| Real-time list updates | Custom polling/WebSocket | `useQuery()` from convex-svelte | Convex subscriptions auto-update when data changes |
| Idempotent migration tracking | Custom localStorage flag | Convex-stored migration record keyed by guestSessionId | Server-side record is authoritative; survives browser clear |

## Common Pitfalls

### Pitfall 1: Sync vs Async ListStore Interface Mismatch
**What goes wrong:** GuestListStore methods are synchronous (in-memory state); ConvexListStore methods return Promises (network mutations). Components calling `store.createList()` and expecting immediate return values will break.
**Why it happens:** The ListStore interface was designed around GuestListStore's synchronous nature.
**How to avoid:** Two approaches: (a) Make ConvexListStore optimistic -- update local derived state immediately, let useQuery reconcile -- or (b) make all mutating ListStore methods return `void | Promise<void>` and handle async at call sites. Approach (a) is cleaner since Convex's real-time subscriptions will naturally update the UI.
**Warning signs:** TypeScript errors about `Promise<GuestList>` not assignable to `GuestList`.

### Pitfall 2: Store Context Cannot Be Reactively Swapped
**What goes wrong:** Svelte `createContext()` sets a value once during component initialization. You cannot reactively change it after mount.
**Why it happens:** Context in Svelte is set during component tree construction, not during rendering.
**How to avoid:** Use a **reactive wrapper store** that internally delegates to either GuestListStore or ConvexListStore. The context holds the wrapper; the wrapper's delegate changes when auth state changes. Alternatively, use a `$state()` variable at the layout level and pass it through context.
**Warning signs:** Stale store reference after sign-in; components still reading from GuestListStore.

### Pitfall 3: Natural Key Resolution Failures During Migration
**What goes wrong:** Guest items reference catalog items by `type:number` natural key. If a catalog item doesn't exist in Convex (deleted, not yet seeded), the migration fails for that item.
**Why it happens:** Guest mode doesn't validate that catalog items actually exist -- any type:number combo can be added.
**How to avoid:** Migration action should skip items whose natural key doesn't resolve to a catalogItemId, log them as warnings, and still complete successfully. Report skipped items in the migration result.
**Warning signs:** Migration action throws on first unresolvable reference, blocking the entire migration.

### Pitfall 4: Race Condition on Auth State Change
**What goes wrong:** User signs in, ClerkStore fires listener update, layout tries to create ConvexListStore, but Convex auth token hasn't propagated yet. First `useQuery()` call fails with "Unauthorized".
**Why it happens:** Clerk listener fires before `convex.setAuth()` callback resolves the new token.
**How to avoid:** Wait for Convex client to be authenticated before creating ConvexListStore. The shimmer state covers this delay. Check that `useQuery()` returns data (not loading) before replacing shimmer.
**Warning signs:** Flash of "Unauthorized" error after sign-in.

### Pitfall 5: localStorage Not Cleared on Migration Success
**What goes wrong:** Migration succeeds, but localStorage still has guest data. Next time user visits as guest, they see stale data. If they sign in again, migration runs again.
**Why it happens:** Developer forgets to clear localStorage after confirmed migration success.
**How to avoid:** Migration client orchestrator must: (1) call Convex action, (2) wait for success confirmation, (3) then and only then call `localStorage.removeItem('diddl-guest-data')`. Idempotency via guestSessionId protects against double-migration even if localStorage lingers.
**Warning signs:** Duplicate lists appearing after second sign-in.

### Pitfall 6: Clerk afterSignOutUrl Mismatch
**What goes wrong:** Currently `afterSignOutUrl` is set to `/app` in ClerkStore. D-05 requires redirect to `/`.
**Why it happens:** Phase 1/2 set it to `/app` for guest mode. Must be updated.
**How to avoid:** Update `clerk.load({ afterSignOutUrl: '/' })` in ClerkStore constructor.
**Warning signs:** User sees guest app page after sign-out instead of landing page.

## Code Examples

### Clerk Modal Theming (D-03)
```typescript
// Source: Clerk docs - Appearance Prop Variables
// Applied in ClerkStore constructor via clerk.load()

await this.clerk.load({
  ui,
  afterSignOutUrl: '/',
  signInForceRedirectUrl: '/app',
  signUpForceRedirectUrl: '/app',
  appearance: {
    variables: {
      // Map to app's stone theme CSS custom properties
      colorPrimary: '#292524',       // stone-800
      colorBackground: '#ffffff',     // white (light mode)
      colorForeground: '#0c0a09',    // stone-950
      colorInput: '#f5f5f4',         // stone-100
      colorBorder: '#e7e5e4',        // stone-200
      colorMuted: '#f5f5f4',         // stone-100
      colorMutedForeground: '#78716c', // stone-500
      fontFamily: 'Inter Variable, sans-serif',
      borderRadius: '0.625rem',      // matches --radius
    }
  }
});
```

### UserButton Mounting (D-12)
```svelte
<!-- Source: Existing pattern in src/routes/app/+page.svelte -->
{#if clerkContext.currentUser}
  <div
    {@attach (el) => {
      clerkContext.clerk.mountUserButton(el);
    }}
  ></div>
{:else if clerkContext.isClerkLoaded}
  <Button variant="outline" size="sm" onclick={() => clerkContext.clerk.openSignIn()}>
    <LogIn class="mr-2 size-4" />
    Sign In
  </Button>
{/if}
```

### Convex Authed List Query
```typescript
// Source: Existing authedQuery pattern from src/convex/authed/helpers.ts

import { v } from 'convex/values';
import { authedQuery, authedMutation } from './helpers';

export const listByOwner = authedQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('lists')
      .withIndex('by_owner', (q) => q.eq('ownerSubject', ctx.identity.subject))
      .collect();
  }
});

export const create = authedMutation({
  args: { name: v.string(), color: v.string() },
  handler: async (ctx, args) => {
    // Check 3-list cap (D-15)
    const existing = await ctx.db
      .query('lists')
      .withIndex('by_owner', (q) => q.eq('ownerSubject', ctx.identity.subject))
      .collect();
    if (existing.length >= 3) {
      throw new Error('List limit reached');
    }
    return await ctx.db.insert('lists', {
      name: args.name,
      color: args.color,
      ownerSubject: ctx.identity.subject,
    });
  }
});
```

### Client Mutation Call
```typescript
// Source: Existing pattern from src/routes/app/references/+page.svelte

import { useConvexClient } from 'convex-svelte';
import { api } from '../../convex/_generated/api';

const client = useConvexClient();

// Mutations return a promise
const listId = await client.mutation(api.authed.lists.create, {
  name: 'My Collection',
  color: '#e11d48'
});
```

### Migration Client Orchestrator
```typescript
// Pattern: Retry with backoff + toast feedback

import { toast } from 'svelte-sonner';

async function migrateGuestData(
  client: ConvexClient,
  guestData: StoragePayload,
  guestSessionId: string
): Promise<boolean> {
  const delays = [1000, 2000, 4000];

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      await client.action(api.authed.migration.migrateGuestData, {
        guestSessionId,
        lists: guestData.lists.map(l => ({ id: l.id, name: l.name, color: l.color })),
        items: guestData.items.map(i => ({
          listId: i.listId,
          type: i.catalogRef.type,
          number: i.catalogRef.number,
          condition: i.condition,
          quantity: i.quantity,
          complete: i.complete,
          tags: i.tags,
        })),
      });

      // Success -- clear localStorage
      localStorage.removeItem('diddl-guest-data');
      toast.success('Your collection has been saved to your account.');
      return true;
    } catch (error) {
      if (attempt < delays.length) {
        toast.info('Could not save collection. Retrying...');
        await new Promise(r => setTimeout(r, delays[attempt]));
      }
    }
  }

  toast.warning("Data safe in browser. We'll try again next time.");
  return false;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Clerk `<SignIn>` component mount | `clerk.openSignIn()` modal API | Clerk 5.x+ | No route needed; modal overlay handles everything |
| Clerk React-style `<UserButton>` | `clerk.mountUserButton(el)` imperative mount | Clerk vanilla JS SDK | Works without framework-specific bindings |
| Manual Convex auth token refresh | `convex.setAuth(callback)` auto-refresh | convex-svelte 0.0.12 | ConvexWrapper already handles this |
| Convex schema migration for new tables | Tables already defined in schema.ts | Phase 1 | lists/listItems tables ready; no schema changes needed |

## Open Questions

1. **ListStore Interface Async Compatibility**
   - What we know: GuestListStore `createList()` returns `GuestList` synchronously. ConvexListStore needs async mutations.
   - What's unclear: Whether to change the interface to be async or use optimistic updates in ConvexListStore.
   - Recommendation: Use optimistic pattern in ConvexListStore -- return a placeholder immediately, let `useQuery()` reconcile with server state. This avoids changing the interface and breaking GuestListStore.

2. **GuestSessionId Storage Location**
   - What we know: CF-03 says guestSessionId is the idempotency key. Migration records must persist server-side.
   - What's unclear: Where to store the guestSessionId on the client (separate localStorage key? Part of guest data payload?).
   - Recommendation: Store as a separate `localStorage.getItem('diddl-guest-session-id')` that persists independently of list data. Generate on first GuestListStore creation if not present. On server side, store migration records in a new `migrations` table or as a field on `userProfiles`.

3. **Reactive Store Wrapper vs Context Re-set**
   - What we know: Svelte context is set once during component init. Store needs to switch from Guest to Convex on sign-in.
   - What's unclear: Whether Svelte 5 `createContext()` supports reactive updates or needs a wrapper.
   - Recommendation: Use a reactive wrapper: the context holds a `$state<ListStore>` that can be swapped. The wrapper delegates all calls to the current underlying store. This is the safest approach.

4. **Schema Changes for Migration Tracking**
   - What we know: Need to track which guestSessionIds have been migrated.
   - What's unclear: Whether to add a `migrations` table to the schema or track on userProfiles.
   - Recommendation: Add a small `migrations` table with `ownerSubject` + `guestSessionId` + `migratedAt` fields. Simpler than overloading userProfiles. Requires `bun run convex:gen` after schema update.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/lib/stores/clerk.svelte.ts` -- Clerk initialization and reactive state
- Existing codebase: `src/lib/lists/listTypes.ts` -- ListStore interface contract
- Existing codebase: `src/lib/lists/listStore.svelte.ts` -- GuestListStore reference implementation
- Existing codebase: `src/convex/schema.ts` -- lists/listItems tables with indexes
- Existing codebase: `src/convex/authed/helpers.ts` -- authedQuery/authedMutation/authedAction wrappers
- Existing codebase: `src/lib/wrappers/ConvexWrapper.svelte` -- Convex auth token setup
- Existing codebase: `src/routes/app/+page.svelte` -- UserButton mounting pattern
- [Clerk JS SDK Reference](https://clerk.com/docs/reference/javascript/clerk) -- openSignIn, mountUserButton API
- [Clerk Appearance Variables](https://clerk.com/docs/customization/variables) -- colorPrimary, colorBackground, etc.
- [Convex Svelte docs](https://docs.convex.dev/client/svelte) -- useQuery, useConvexClient patterns
- [Convex Writing Data](https://docs.convex.dev/database/writing-data) -- mutation/action patterns
- [Convex Migration Patterns](https://stack.convex.dev/migrating-data-with-mutations) -- idempotent batch migration

### Secondary (MEDIUM confidence)
- [convex-svelte npm](https://www.npmjs.com/package/convex-svelte) -- API surface confirmation
- [Clerk Themes npm](https://www.npmjs.com/package/@clerk/themes) -- prebuilt theme availability

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and in use
- Architecture: HIGH -- patterns derived from existing codebase conventions
- Pitfalls: HIGH -- derived from concrete code analysis (sync/async mismatch, context behavior)
- Migration pattern: MEDIUM -- Convex action transactional semantics verified via docs, but multi-step action-calling-mutation pattern needs implementation validation

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (stable -- all libraries are already pinned in the project)
