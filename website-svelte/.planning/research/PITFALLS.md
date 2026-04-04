# Domain Pitfalls

**Domain:** Collectible catalog browser + personal collection manager
**Stack:** SvelteKit + Convex + Effect v4 + Clerk
**Researched:** 2026-04-02

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or hard-to-reverse architectural decisions.

---

### Pitfall 1: Convex Reactive Subscriptions on the Full Catalog Table

**What goes wrong:** Subscribing to catalog items without tight index + pagination boundaries causes Convex to re-execute and re-transmit the entire result set on every document change. One mutation to a single catalog item invalidates every subscriber reading that table.

**Why it happens:** Developers treat Convex like a REST endpoint and write `db.query("catalog").collect()` or `db.query("catalog").filter(...)` without `.withIndex()`. With 10k items across 27 types, even a `.filter()` by type does a full table scan — Convex's `.filter()` is a post-scan filter, not an index.

**Consequences:**

- Each catalog admin edit triggers a multi-megabyte re-send to every connected browser
- Hits Convex's 32,000 documents-scanned-per-transaction limit as catalog grows
- Query times become unpredictable; free/starter tier bandwidth bills spike
- Confirmed pattern in the wild: one browse-page query reading 17 MB per call before optimization (OpenClaw case study)

**Prevention:**

- Define a compound index on `(type, number)` in the Convex schema before writing any queries
- All catalog queries must use `.withIndex("by_type_number", q => q.eq("type", type).gte("number", start).lte("number", end))`
- Use `usePaginatedQuery` (or Convex's paginate helper in SvelteKit) — never `.collect()` on the catalog table
- Target max 100 items per page (matching the "number ranges of 100" sidebar design)

**Warning signs:**

- Any `db.query("catalog").collect()` call in query functions
- Convex dashboard showing high "Documents Scanned" per function execution
- Slow query warnings when catalog grows beyond a few hundred items during development

**Phase:** Address in Schema + Catalog Phase (first functional phase). Index design cannot be retrofitted without migration cost.

---

### Pitfall 2: Guest-to-Auth Migration Creates Duplicate or Lost Data

**What goes wrong:** The migration from localStorage to Convex on signup is treated as a one-shot fire-and-forget. If the user reloads mid-migration, re-runs sign-up, or the Convex mutation fails partway, they end up with duplicate lists or silently lost data.

**Why it happens:**

- Migration is triggered optimistically on Clerk's `onSignIn` callback without idempotency guards
- `localStorage` is cleared before Convex mutations confirm success
- No transactional boundary: Convex mutations are per-document, not cross-document atomic for large migrations

**Consequences:**

- User loses their guest collection on migration failure (permanent data loss, no recovery)
- Duplicate lists if migration runs twice (user created lists, migrated, cleared localStorage, then saw empty Convex and tried again)
- Silent failures if Effect pipeline's error channel is not surfaced to the UI

**Prevention:**

- Migration mutation must be idempotent: use `db.query("lists").withIndex("by_userId_guestId", ...).unique()` to upsert rather than insert
- Keep a `migrationStatus` flag in localStorage (`"pending"` → `"complete"`); only clear localStorage after Convex confirms success
- Wrap the full migration in a Convex action that orchestrates multiple mutations and reports a final status back to the client before clearing localStorage
- Surface migration errors explicitly in UI — do not swallow them in Effect's defect channel
- Add a `guestSessionId` field to lists imported from guest mode; this becomes the idempotency key

**Warning signs:**

- Migration written as a series of independent `authedMutation` calls without a coordinating action
- localStorage cleared in `onSignIn` before awaiting mutation results
- No idempotency key on list/list-item inserts

**Phase:** Address in Guest Mode + Auth Phase. Must be designed before writing the migration path — retrofitting idempotency after the fact requires a data migration.

---

### Pitfall 3: Admin Bulk Import Exceeds Convex Mutation Transaction Limits

**What goes wrong:** A single Convex mutation tries to insert all CSV rows in one transaction, hitting the 16,000 documents-written or 16 MiB write limit, causing the entire import to fail with no partial success or progress feedback.

**Why it happens:** The pattern `rows.forEach(row => ctx.db.insert("catalog", row))` inside a mutation looks fine for small imports but silently breaks at scale. 10k catalog items with image metadata easily hits the write limit.

**Consequences:**

- Import silently fails or throws after several seconds of apparent progress
- Admin has no visibility into how many rows succeeded
- Partial state if Convex rolls back mid-transaction (less likely than silent truncation but possible)
- Action timeout (10 minutes) can be hit if image uploads are interleaved with inserts

**Prevention:**

- Use a Convex action (not mutation) as the import orchestrator
- Action calls a `privateAction` (key-guarded) that inserts records in batches of 100 via internal mutations
- Batch size of 100 stays well within the 16,000 document write limit per transaction
- Return progress updates via a progress document (e.g., `importJobs` table) that the UI polls with `useQuery`
- Image uploads must be handled separately from metadata inserts: upload file → get storageId → then batch-insert catalog rows with storageId references
- CSV parsing and validation happens client-side or in SvelteKit server route before calling Convex

**Warning signs:**

- Bulk insert written as a single mutation with `rows.forEach`
- No batching logic in the import path
- Image upload and database insert in the same mutation call

**Phase:** Address in Admin Phase. The import architecture needs a job/progress pattern designed upfront.

---

### Pitfall 4: Convex File Storage URLs Treated as Permanent Cache Keys

**What goes wrong:** Image `src` attributes are populated with Convex `storage.getUrl()` output and cached in the client indefinitely or stored in the database as permanent URLs. Convex's file serving URL format can change and does not guarantee permanent, CDN-cached URLs.

**Why it happens:** The API returns a URL and it works — developers assume it is stable like an S3 public URL. In practice, Convex file URLs are not indefinitely cacheable and there is no built-in CDN layer for file storage.

**Consequences:**

- Browsers re-fetch all 10k product images on every page load with no HTTP caching benefit
- Storing `storageUrl` strings in the database creates stale references if Convex storage internals change
- Serving 10k images through Convex's HTTP action path (20 MB limit per response) is an unnecessary bottleneck for a catalog grid

**Prevention:**

- Store only `storageId` (the opaque Convex storage ID) in the catalog schema — never a derived URL
- Generate `getUrl()` output at query time and include it in the query response alongside catalog data
- Set browser-level image `loading="lazy"` on all catalog grid images — this is non-negotiable for a 100-item grid
- For the 1.0 scope, Convex file storage is acceptable; plan a migration path to a CDN (Cloudflare R2 or similar) as a future phase if bandwidth costs become an issue
- Use `<img width="..." height="...">` attributes on every catalog image to prevent layout shift during lazy load

**Warning signs:**

- `storageUrl` string field in the Convex schema instead of `storageId`
- No lazy loading attributes on catalog grid images
- Images fetched eagerly on sidebar navigation before the user sees the grid

**Phase:** Schema Phase (storageId vs storageUrl decision). Image performance hardening in the Catalog Browse Phase.

---

### Pitfall 5: Svelte 5 Global `$state` Leaking Across SSR Requests

**What goes wrong:** Shared reactive state (e.g., "current selected type" or "active list") is exported from a `.svelte.ts` module at module scope. On the SvelteKit server during SSR, this module is a singleton — state set during one user's request leaks into the next user's SSR render.

**Why it happens:** Svelte 5 runes work in `.ts` files, making it tempting to create global state singletons that work on both client and server. The behavior differs: on the client each browser session gets its own module instance; on the server all concurrent requests share one module instance.

**Consequences:**

- User A's selected type or list flashes on User B's initial SSR render
- Subtle, non-deterministic bugs that only appear under concurrent load (not in local dev)
- Auth state (Clerk identity) potentially visible to wrong user if stored in global rune

**Prevention:**

- Never export `$state` variables at module scope for data that is user-specific or request-specific
- Use Svelte context (`setContext` / `getContext`) in the root `+layout.svelte` for app-wide reactive state; context is per-component-tree instance, which maps to per-request in SSR
- Use `event.locals` in `hooks.server.ts` for server-side request-scoped state
- The existing Svelte 5 runes auth state pattern in the codebase should be audited to confirm it uses context, not a module-level export

**Warning signs:**

- Any `export const selectedType = $state(...)` at the top of a `.ts` file
- Global store modules that hold user-specific state (current list, selected catalog item)
- Auth state accessed via a module-level rune rather than Clerk's context-based hooks

**Phase:** Architecture is established. Audit existing patterns in the Auth + Layout Phase and enforce the context pattern for any new shared state.

---

### Pitfall 6: `$effect` Triggering Infinite Loops on Catalog + List State Sync

**What goes wrong:** A `$effect` that syncs catalog selection state with URL parameters, or that syncs list item state with a Convex optimistic update, reads and writes the same `$state` variable, causing `ERR_SVELTE_TOO_MANY_UPDATES` infinite loops.

**Why it happens:** This is a documented Svelte 5 footgun. Writing to `$state` inside an `$effect` that reads that same state creates a cycle. Arrays and objects are especially vulnerable because assigning a new array reference after reading from it triggers re-execution.

**Consequences:**

- Browser tab crashes or becomes unresponsive
- Hard to reproduce because the loop only manifests when specific state transitions occur
- SvelteKit's dev overlay obscures the root cause, showing only the stack overflow

**Prevention:**

- Use `$derived` for computed values (read-only transformations of state) — never `$effect` for this pattern
- When `$effect` must write to `$state`, wrap the write in `untrack()` to break the dependency
- URL sync (type selection → URL params) should use `pushState`/`replaceState` from `$app/navigation`, not `$effect` writing to a `$state` that also reads from the URL
- Use `$inspect.trace()` (available since Svelte 5.14) during development to trace which signals trigger an effect

**Warning signs:**

- `$effect(() => { someState = derivedValue(otherState); })` — any `$effect` that both reads and writes `$state`
- Catalog filter state synchronized to URL via `$effect` instead of SvelteKit navigation primitives
- Console showing `effect_update_depth_exceeded` during development

**Phase:** Catalog Browse Phase (sidebar/URL sync) and List Detail Phase (optimistic updates).

---

## Moderate Pitfalls

---

### Pitfall 7: Convex Auth Identity Used as Database Key

**What goes wrong:** User records and list ownership are keyed on `identity.email` or `identity.subject` from `ctx.auth.getUserIdentity()`. The `subject` (Clerk user ID) is stable; email is not — users can change their email in Clerk without a corresponding database update.

**Why it happens:** `email` is more human-readable and easier to debug. Developers grab `identity.email` because it's obvious what it is.

**Consequences:**

- User changes email → can no longer access their lists (ownership check fails)
- Hard to debug because the user's identity in Clerk looks correct

**Prevention:**

- Always key user ownership on `identity.subject` (Clerk's stable user ID), never `identity.email`
- Create a `users` table with `clerkId: v.string()` indexed, populated on first authenticated request
- Store `userId` (the Convex document ID from the `users` table) as the foreign key on lists and list items

**Warning signs:**

- Any `db.query("lists").withIndex("by_email", q => q.eq("email", identity.email))` pattern
- Missing `users` table in schema (lists owned directly by Clerk subject without a Convex user document)

**Phase:** Schema Phase — cannot be changed after lists are created without a data migration.

---

### Pitfall 8: Admin Functions Exposed via `authed` Instead of `private`

**What goes wrong:** Catalog CRUD and bulk import mutations are defined with `authedMutation` and guarded only by a role check inside the function body. Any authenticated user who discovers the function name can call it from the browser console.

**Why it happens:** `authed` functions are easier to call from the SvelteKit frontend. Role checks inside functions feel like security.

**Consequences:**

- Any authenticated user can corrupt the catalog or trigger bulk imports via the browser console
- Convex functions are enumerable via the generated `api` object in the client bundle

**Prevention:**

- Admin catalog mutations (create, update, delete catalog items, bulk import, image management) must use `privateMutation` / `privateAction` — called only from SvelteKit server routes, never directly from the browser
- The SvelteKit server route authenticates the admin session via Clerk's server SDK, then calls the private Convex function with the `CONVEX_PRIVATE_BRIDGE_KEY`
- Role checks in `authed` functions are a defense-in-depth measure, not the primary security boundary

**Warning signs:**

- Catalog write mutations using `authedMutation` from `src/convex/authed`
- Admin UI calling Convex functions directly via `useConvexMutation` in the browser

**Phase:** Admin Phase — enforce from the start of admin feature development.

---

### Pitfall 9: Paginated Catalog Losing Cursor on Sidebar Navigation

**What goes wrong:** User browses "A4 1-100", scrolls to page 2, then clicks "A4 101-200" in the sidebar. The pagination cursor state is stored in component-local `$state` and is not reset on type/range change. The component renders stale page-2 data from the previous range.

**Why it happens:** `usePaginatedQuery` cursor state lives in the component. When the query arguments change (new type + range), the cursor from the previous query is still in state until the component re-mounts or cursor is explicitly reset.

**Consequences:**

- Users see wrong items or empty states when switching ranges
- Convex returns an error if a cursor from one query is used with different arguments

**Prevention:**

- Derive the current type and range from URL parameters (`page.params` or `page.url.searchParams`), not component-local state
- When URL params change, the pagination component must reset its cursor to `null`
- Use a keyed `{#key type + range}` block around the paginated catalog grid — Svelte will destroy and recreate the component on key change, resetting cursor automatically
- Alternatively, pass `startCursor: null` explicitly whenever the query arguments change

**Warning signs:**

- Pagination cursor stored in `$state` at the page level without URL-derived reset logic
- No `{#key}` block or explicit cursor reset on sidebar type/range change

**Phase:** Catalog Browse Phase.

---

### Pitfall 10: localStorage Guest State Not Namespaced

**What goes wrong:** Guest lists and items are stored in localStorage under generic keys like `"lists"` or `"collection"`. These keys collide with any other app on the same domain (e.g., localhost during development) or if the app ever shares a domain with another product.

**Why it happens:** Short key names are convenient in early development.

**Consequences:**

- During development, switching between projects corrupts guest data
- If the schema evolves, old localStorage data with the old key format is read as-is, causing parse errors

**Prevention:**

- Namespace all localStorage keys: `diddl:v1:lists`, `diddl:v1:listItems`, `diddl:v1:migrationStatus`
- Include a version segment (`v1`) so schema changes can be detected and old data can be cleared or migrated gracefully
- On app init, check for the presence of unversioned keys and migrate or discard them

**Warning signs:**

- `localStorage.getItem("lists")` without a namespace prefix
- No version handling in localStorage read/write helpers

**Phase:** Guest Mode Phase — establish the namespace convention before writing any localStorage code.

---

## Minor Pitfalls

---

### Pitfall 11: Convex Schema `release_date` as JavaScript `Date` Object

**What goes wrong:** The existing Zod model uses `z.date()` for `release_date`. Convex stores numbers (Unix timestamps) for dates, not JavaScript `Date` objects. Attempting to store a `Date` in a `v.number()` field will fail; attempting to use `v.any()` to paper over it will make the date field unqueryable by index.

**Prevention:**

- Map `release_date` to `v.number()` (Unix timestamp in milliseconds) in the Convex schema
- Create Zod/schema conversion helpers that translate `Date` ↔ `number` at the Convex boundary
- Document this conversion point explicitly so new contributors don't introduce raw `Date` objects into Convex writes

**Phase:** Schema Phase.

---

### Pitfall 12: Convex `not-awaited` Mutations Inside Actions

**What goes wrong:** Inside a Convex action, `ctx.runMutation(...)` calls are not awaited. The action appears to succeed, but the mutations are silently dropped.

**Why it happens:** TypeScript allows calling an async function without `await` if the return type is not checked. The Convex runtime does not throw on unawaited mutations in actions.

**Prevention:**

- Enable the `@typescript-eslint/no-floating-promises` ESLint rule — it is already noted in Convex best practices as the primary guard
- Verify the project ESLint config enforces this rule; add it if absent
- Run `bun run lint` after every Convex action implementation (already in CLAUDE.md workflow)

**Warning signs:**

- `ctx.runMutation(...)` without `await` keyword
- ESLint `no-floating-promises` rule disabled or absent

**Phase:** Ongoing. Enforce from first Convex action written.

---

### Pitfall 13: Assuming `usePaginatedQuery` Is Available in SvelteKit

**What goes wrong:** `usePaginatedQuery` is a React hook. The Convex SvelteKit integration (via `convex-svelte` or manual Convex client) does not expose this hook. Developers copy React examples verbatim.

**Why it happens:** Convex documentation and most community examples are React-first.

**Consequences:**

- Build errors when `usePaginatedQuery` import fails
- Manual cursor management implemented incorrectly as a workaround

**Prevention:**

- Use Convex's paginate API directly: `useConvexQuery` with a cursor argument, managing `continueCursor` as `$state`
- Or use `convex-svelte`'s pagination helpers if they exist for the current version
- Verify the Svelte-specific Convex client API before implementing pagination

**Warning signs:**

- `import { usePaginatedQuery } from "convex/react"` in a `.svelte` file

**Phase:** Catalog Browse Phase.

---

## Phase-Specific Warning Matrix

| Phase                       | Likely Pitfall                                                                                                                                  | Mitigation                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Schema + Catalog data model | Pitfall 1 (no index), Pitfall 4 (storageUrl in schema), Pitfall 7 (email as key), Pitfall 11 (Date type)                                        | Define compound index `(type, number)` and user key on `subject` before first query |
| Catalog Browse              | Pitfall 1 (scan queries), Pitfall 4 (eager image loading), Pitfall 6 ($effect URL sync), Pitfall 9 (cursor not reset), Pitfall 13 (React hooks) | Index all queries; key paginator on URL params; lazy load all images                |
| Guest Mode + Auth           | Pitfall 2 (migration data loss), Pitfall 10 (localStorage namespace)                                                                            | Idempotent migration action; versioned localStorage keys                            |
| Auth + Layout               | Pitfall 5 (global $state SSR leak), Pitfall 7 (identity key)                                                                                    | Context-based global state; `subject`-keyed ownership                               |
| List Management             | Pitfall 6 ($effect loops), Pitfall 12 (unawaited mutations)                                                                                     | `$derived` over `$effect`; no-floating-promises lint rule                           |
| Admin                       | Pitfall 3 (bulk import limits), Pitfall 8 (auth boundary)                                                                                       | Batched action with progress tracking; `privateMutation` for all catalog writes     |

---

## Sources

- [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/) — official anti-patterns including unawaited promises, internal vs api function references
- [Queries That Scale — Convex Stack Blog](https://stack.convex.dev/queries-that-scale) — scanning anti-pattern, cache invalidation via frequent field updates, real 17MB → 20KB optimization
- [Convex Limits](https://docs.convex.dev/production/state/limits) — 32k documents scanned, 16k written, 16 MiB, 10 min action timeout
- [Convex Paginated Queries](https://docs.convex.dev/database/pagination) — cursor management, reactive page size changes
- [Convex File Storage — Serving Files](https://docs.convex.dev/file-storage/serve-files) — storage.getUrl() behavior
- [Bandwidth Concerns Issue #95](https://github.com/get-convex/convex-backend/issues/95) — confirmed reactive re-send of full lists on single document mutation
- [Global State in Svelte 5 — Mainmatter](https://mainmatter.com/blog/2025/03/11/global-state-in-svelte-5/) — SSR contamination, context pattern
- [Svelte $effect Infinite Loop Issues](https://github.com/sveltejs/svelte/issues/15398) — confirmed ERR_SVELTE_TOO_MANY_UPDATES pattern
- [Svelte $effect Circular Dependency Discussion](https://github.com/sveltejs/svelte/discussions/11551) — self-triggering effects
- [Convex Actions Documentation](https://docs.convex.dev/functions/actions) — 10 min timeout, batching pattern for large data
- [Convex Writing Data](https://docs.convex.dev/database/writing-data) — bulk insert batching guidance
