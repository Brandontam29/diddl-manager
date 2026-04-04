# Project Research Summary

**Project:** Diddl Manager — catalog browser + collection list manager
**Domain:** Collectible catalog browser + personal collection list manager
**Researched:** 2026-04-02
**Confidence:** HIGH

## Executive Summary

Diddl Manager is a niche collectible tracker in the same category as Discogs (vinyl), Coleka (general collectibles), and Panini Collectors (sticker albums). The core user journey is: browse a catalog of ~10k items organized by type and number range, add items to personal lists, and track condition, quantity, and completion status per item. Research across comparable apps confirms that collectors expect multiple named lists, per-item condition and count fields, a completion percentage view, and a "missing items" filter — these are table stakes, not differentiators. The recommended approach is to build in a strict dependency order: schema and catalog browsing first (everything else depends on data being visible), guest list mode second (validates the data model before auth is layered on), auth and migration third, then profile, then admin tooling last.

The existing stack is entirely locked and well-chosen for this domain. No re-architecting is needed. Three packages should be added as direct dependencies: `runed` (Svelte 5-native `PersistedState` for guest mode), `zod` (promote from transitive dep to direct dep for Zod v4 stability), and `papaparse` (CSV parsing for admin bulk import). The critical architectural insight from research is that the `ListStore` interface — an abstract seam between `GuestListStore` (localStorage-backed) and `ConvexListStore` (Convex-backed) — must be defined before any list UI is written. This seam makes guest-to-auth migration a context swap rather than a conditional path threaded through every list component.

The top risks are (1) Convex catalog queries written without the `(type, number)` compound index, which will cause full-table scans of 10k items and reactive re-sends on every admin edit; (2) the guest-to-auth migration being non-idempotent, which risks silent data loss or duplicate lists on network failure at signup; and (3) Svelte 5 module-scoped `$state` leaking across SSR requests. All three are addressed at the schema and architecture design stage — retrofitting them later requires data migrations or significant refactors.

---

## Key Findings

### Recommended Stack

The stack is brownfield-locked. The only additions required are three packages: `runed` for Svelte 5-native localStorage persistence (the only runes-idiomatic solution; `svelte-persisted-store` is explicitly unsettled for Svelte 5), `zod` promoted to a direct dependency at v4 (v4 is stable, the existing `convex-helpers` peer dep supports `^3.25.0 || ^4.0.0`, and riding it as a transitive dep is fragile), and `papaparse` for browser/server CSV parsing in the admin bulk import flow. Virtual scrolling is deferred — sidebar-range pagination keeps each view to ~100 items, which is well within direct DOM rendering limits. shadcn-svelte is deferred — Runes mode issues as of early 2025 make it inconsistent with the existing codebase pattern of raw Tailwind.

**Core technologies:**
- SvelteKit 2.55.0: Full-stack framework and routing — locked
- Svelte 5 (Runes mode) 5.53.11: UI primitives; use `$state`, `$derived`, `$effect`, `$props` exclusively — locked
- Convex 1.33.0: Database, reactive queries, file storage, serverless functions — locked
- convex-svelte 0.0.12: `useQuery` and `useConvexClient` bindings; note that `usePaginatedQuery` is React-only and does not exist here — locked
- convex-helpers 0.1.114: `customQuery`, `customMutation`, `customAction` wrappers — locked
- Clerk 6.3.0: Auth and session management — locked
- Effect v4 (4.0.0-beta.31): Backend error handling and service composition — locked
- Tailwind CSS v4 4.2.1: Styling — locked
- runed ^0.37.1: `PersistedState` for guest localStorage; `useIntersectionObserver` for lazy image loading — **ADD**
- zod ^4.3.6: Schema validation and TypeScript inference; promote from transitive to direct dep — **ADD**
- papaparse ^5.5.3: CSV parsing for admin bulk import — **ADD**

### Expected Features

Collector app research (Discogs, Panini Collectors, Coleka, TCGPlayer, MyFigureCollection) establishes a clear feature hierarchy for this domain.

**Must have (table stakes):**
- Catalog browsing with images — visual recognition is how collectors identify items; text-only fails
- Add item to a list from catalog view — one-click or two-tap; the primary user action
- Multiple lists per user — collectors segment by "Owned", "Wishlist", "For Trade", "Duplicate"
- Per-item condition tagging — Discogs and TCGPlayer both treat this as non-optional from day one
- Per-item quantity/count — collectors accumulate duplicates; increment/decrement UI preferred
- Mark item complete/incomplete — the defining UX of checklist-style apps (Panini, Coleka)
- Completion percentage per list — every comparable app shows this prominently
- Remove item from list — with soft-delete confirmation for destructive action
- Guest mode with full trial and data migration on signup — lowers barrier; converts users who try before committing
- Sidebar navigation by type + range — 10k items require chunking; type-first is the collector mental model
- Auth (Clerk login/signup) — persistent data across devices

**Should have (differentiators):**
- Duplicate a list item to tag differently — same catalog item, two physical copies in different condition; Discogs handles this poorly
- "Missing items" filtered view per list — most common question after setup; reduces cognitive load
- User profile page — personal identity layer; community foundation
- Per-list deletion with confirmation — trust-critical for destructive actions
- Multi-image support (schema-ready) — no UI needed in v1; just schema flexibility to avoid later migration pain
- Add items to list from within list detail view — friction-reducing; ship after catalog-to-list flow works

**Defer (v2+):**
- Global search across all types — meaningful only after catalog is fully populated and users are power users
- Multi-image UI — schema is ready; surface when catalog images are more complete
- Social features, marketplace, public collection profiles, real-time price tracking, barcode scanning — all explicitly out of scope per PROJECT.md or have no data source for this niche collectible

### Architecture Approach

The recommended architecture builds directly on the existing wired infrastructure (Clerk auth, Convex bindings, Effect service layer, SvelteKit routing) without re-architecting anything. The most important structural decision is the `ListStore` interface as an abstract seam between `GuestListStore` (Svelte 5 rune class, localStorage-backed) and `ConvexListStore` (Svelte 5 rune class, Convex-backed). Both implement the same interface so list UI components are identical regardless of auth state. The switchover from guest to authed store happens atomically in the root layout's `$effect` when Clerk signals a sign-in. All catalog queries must use the `(type, number)` compound Convex index and return image URLs (`ctx.storage.getUrl(storageId)`) alongside catalog data — the client should never call storage APIs directly. Admin write operations must go through `private/` Convex functions called from SvelteKit server routes, never through `authed/` functions called from the browser.

**Major components:**
1. `CatalogSidebar` + `CatalogGrid` + `CatalogItemCard` — catalog browsing layer; sidebar is pure navigation (no data fetch), grid fetches one bounded range via `useQuery` with `by_type_number` index
2. `ListStore` interface / `GuestListStore` / `ConvexListStore` — list management seam; `ListsSidebar` and `ListDetail` consume only the interface
3. `MigrationService` + `AuthStateWatcher` — guest-to-auth migration; reads localStorage, calls `authed/migration.importGuestData`, clears localStorage only on confirmed success
4. Admin layer (private Convex functions + SvelteKit server routes) — catalog CRUD, chunked bulk import, image management, type management; all writes behind `CONVEX_PRIVATE_BRIDGE_KEY`
5. `authed/` Convex functions — catalog queries, list CRUD, list-item CRUD, profile, migration; protected by Clerk JWT
6. `private/` Convex functions — admin catalog mutations, bulk import actions, image upload coordination; called server-side only

### Critical Pitfalls

1. **Catalog queries without compound index** — `db.query("catalog").filter(...)` does a full table scan of 10k items; every admin edit re-sends the full result set to all subscribers. Prevention: define `(type, number)` compound index before writing any catalog query, use `.withIndex("by_type_number", ...)` everywhere.

2. **Non-idempotent guest-to-auth migration** — clearing localStorage before Convex confirms success causes permanent data loss on network failure; double-firing on re-render creates duplicate lists. Prevention: use a `migrationStatus` key in localStorage (`pending` → `complete`); add a `guestSessionId` idempotency key to migrated lists; clear localStorage only after Convex action returns success.

3. **Svelte 5 module-scoped `$state` leaking across SSR requests** — module-level rune exports are singletons on the server; user A's state bleeds into user B's SSR render. Prevention: all app-wide reactive state must use Svelte `setContext`/`getContext` in the root layout, not module-level exports.

4. **`$effect` infinite loops on catalog/list state sync** — writing to `$state` inside an `$effect` that reads the same state triggers `ERR_SVELTE_TOO_MANY_UPDATES`. Prevention: use `$derived` for computed values; use `untrack()` when `$effect` must write to `$state`; use SvelteKit navigation primitives for URL sync.

5. **Admin functions exposed via `authed/` instead of `private/`** — any authenticated user can call catalog write mutations from the browser console. Prevention: all catalog writes, bulk import, and image management must use `privateMutation`/`privateAction`, called only from SvelteKit server routes.

---

## Implications for Roadmap

Based on research, the dependency graph is clear and dictates a five-phase order. Nothing in the feature set is ambiguous enough to justify reordering.

### Phase 1: Schema + Catalog Foundation

**Rationale:** The Convex schema is the dependency root for everything else. Catalog browsing is the core value proposition and must exist before lists are useful. The compound index must be created before any query is written — retrofitting it later requires a schema migration. Image storage pattern (storageId in schema, getUrl in query) is established here.

**Delivers:** Browsable catalog with images, sidebar navigation by type and number range, Convex schema for all tables.

**Addresses:** Catalog browsing with images, sidebar navigation by type + range, catalog image display.

**Avoids:** Pitfall 1 (full-table scan without index), Pitfall 4 (storageUrl in schema instead of storageId), Pitfall 7 (Clerk email as DB key — establish `subject`-based ownership from day one), Pitfall 11 (Date vs number for release_date).

### Phase 2: Guest List Mode

**Rationale:** Building list functionality against localStorage first (without Convex) validates the data model and the `ListStore` interface independently of auth. If the data model is wrong, it is cheaper to fix before the Convex backend functions are written. Guest mode is also a table-stakes feature that lowers signup friction.

**Delivers:** Full list CRUD (create, rename, color, delete), list-item CRUD (add, remove, condition, count, complete toggle, duplicate), completion percentage, missing items view — all working in localStorage without auth.

**Addresses:** Multiple lists per user, per-item condition tagging, per-item quantity/count, mark complete/incomplete, completion percentage per list, remove item from list, guest mode with full trial.

**Avoids:** Pitfall 10 (unnamespaced localStorage keys — establish `diddl:v1:` namespace immediately), Pitfall 6 ($effect loops in list item state).

### Phase 3: Auth + Migration

**Rationale:** Auth layers on top of the working guest system. `ConvexListStore` must implement the same interface as `GuestListStore` so list components require no changes. Migration must be designed before it is written — retrofitting idempotency into a live migration is a data recovery problem.

**Delivers:** Clerk sign-in/sign-up, `ConvexListStore` backed by `authed/lists` and `authed/listItems`, `authed/migration.importGuestData` (idempotent), `AuthStateWatcher` that triggers migration and switches store context.

**Addresses:** Clerk authentication, guest-to-authed data migration.

**Avoids:** Pitfall 2 (migration data loss — idempotent mutation with `guestSessionId` key, localStorage cleared only after confirmed success), Pitfall 5 (SSR state leak — use context for all shared state), Pitfall 7 (email as identity key).

### Phase 4: Profile

**Rationale:** Standalone; no dependencies on catalog or list logic beyond auth being present. Low complexity, delivers personal identity layer.

**Delivers:** Profile page (name, bio, hobbies, picture), `authed/profile` get and upsert functions, picture upload via Convex storage.

**Addresses:** User profile page.

**Avoids:** Pitfall 4 (image URL caching — use storageId pattern established in Phase 1).

### Phase 5: Admin

**Rationale:** Admin tooling must come last because it depends on the full schema (established in Phase 1) and the image storage pattern (Phase 1). The catalog should be seeded before the public launch, but admin is not needed for the guest/auth user experience. Chunked bulk import with progress tracking must be designed upfront — retrofitting batching into a single-mutation import requires deleting and rewriting the import endpoint.

**Delivers:** Role-gated admin routes, `AdminCatalogTable` (individual CRUD), `AdminBulkImport` (CSV/JSON → chunked private Convex actions with progress), `AdminImageManager` (generateUploadUrl flow), `AdminTypeManager` (DiddlType CRUD).

**Addresses:** Admin bulk CSV/JSON import, admin image management, admin DiddlType management.

**Avoids:** Pitfall 3 (bulk import transaction limits — 100-record chunks via `privateAction`; progress via `importJobs` table), Pitfall 8 (admin functions in `authed/` — all admin writes in `private/`).

### Phase Ordering Rationale

- Schema must precede all other phases because the Convex index and document types are the shared foundation.
- Guest list mode precedes auth because it validates the `ListStore` interface and data model independently, and because it is a user-facing feature (not just scaffolding).
- Auth and migration follow guest mode because they require stable list data to migrate.
- Profile is independent but placed after auth because it requires an authenticated user.
- Admin is placed last because it requires the full schema, file storage pattern, and is not needed for the public user experience.
- This ordering mirrors the dependency graph in FEATURES.md exactly.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Auth + Migration):** The exact `guestSessionId` idempotency key mechanism and Convex action coordination pattern for multi-step migration needs implementation-level design before coding starts.
- **Phase 5 (Admin):** The `importJobs` progress tracking pattern (Convex document polled by `useQuery`) and the CSV validation/deduplication strategy for re-imports need upfront design. The Clerk admin role metadata field path in `ctx.auth.getUserIdentity()` needs verification during implementation.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Schema + Catalog):** Convex schema definition and indexed queries are well-documented with official sources. The `storageId`/`getUrl` pattern is confirmed. No additional research needed.
- **Phase 2 (Guest List Mode):** `runed` `PersistedState` is documented; `ListStore` interface is a standard strategy pattern. No additional research needed.
- **Phase 4 (Profile):** Standard CRUD with Convex + image upload using the same flow established in Phase 1. No additional research needed.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Existing stack is inspected from the codebase directly; new additions (runed, zod, papaparse) confirmed from official npm and docs |
| Features | HIGH | Validated against 6+ comparable apps (Discogs, Panini Collectors, Coleka, TCGPlayer, MyFigureCollection, Classifier); feature set is well-understood for this domain |
| Architecture | HIGH | Existing infrastructure inspected from codebase; Convex patterns verified from official docs; all major decisions have documented sources |
| Pitfalls | HIGH | Pitfalls sourced from official Convex limits docs, official Svelte 5 GitHub issues, and confirmed real-world case studies (OpenClaw 17MB → 20KB optimization) |

**Overall confidence:** HIGH

### Gaps to Address

- **Clerk admin role metadata field path:** The exact path for `publicMetadata.role` in `ctx.auth.getUserIdentity()` within Convex functions is MEDIUM confidence. Verify during Phase 5 implementation before writing admin gate logic.
- **`runed` version compatibility:** Confirmed as actively maintained at 0.37.1 ~3 months ago; verify it has no breaking changes for the specific `PersistedState` API when installing.
- **convex-svelte pagination helpers:** Confirmed no `usePaginatedQuery` in the current version, but the sidebar-range design avoids needing it entirely. If a type ever exceeds 100 items in a single range, the sidebar must subdivide the range — this is a navigation UX decision to flag during Phase 1 sidebar design.
- **Convex `importGuestData` atomicity:** Multiple list + list-item inserts in one migration action are not a single atomic transaction. The idempotency key design (Pitfall 2 mitigation) compensates for this, but the exact failure and retry behavior should be validated during Phase 3 implementation.

---

## Sources

### Primary (HIGH confidence)
- [Convex Paginated Queries](https://docs.convex.dev/database/pagination)
- [Convex Queries That Scale](https://stack.convex.dev/queries-that-scale)
- [Convex File Storage: Upload Files](https://docs.convex.dev/file-storage/upload-files)
- [Convex File Storage: Serve Files](https://docs.convex.dev/file-storage/serve-files)
- [Convex Data Import](https://docs.convex.dev/database/import-export/import)
- [Convex Best Practices](https://docs.convex.dev/understanding/best-practices/)
- [Convex Limits](https://docs.convex.dev/production/state/limits)
- [Convex Actions](https://docs.convex.dev/functions/actions)
- [convex-svelte GitHub](https://github.com/get-convex/convex-svelte)
- [runed PersistedState](https://runed.dev/docs/utilities/persisted-state)
- [Zod v4 release](https://zod.dev/v4)
- [PapaParse npm](https://www.npmjs.com/package/papaparse)
- Existing codebase inspection (`src/convex/`, `src/lib/`, `models/`)

### Secondary (MEDIUM confidence)
- [Discogs Collection Feature](https://support.discogs.com/hc/en-us/articles/360007331534) — list and folder structure patterns
- [Panini Collectors App](https://www.paninigroup.com/en/gb/panini-collectors-app) — completion tracking UX patterns
- [Coleka on Google Play](https://play.google.com/store/apps/details?id=com.xnview.coleka) — general collectible tracker patterns
- [TCGPlayer Card Conditioning](https://help.tcgplayer.com/hc/en-us/articles/221430307-Card-Conditioning-Overview) — condition grading standards
- [Global State in Svelte 5 — Mainmatter](https://mainmatter.com/blog/2025/03/11/global-state-in-svelte-5/) — SSR contamination and context pattern
- [Convex Bandwidth Issue #95](https://github.com/get-convex/convex-backend/issues/95) — reactive re-send behavior confirmed
- [Svelte $effect Infinite Loop Issues](https://github.com/sveltejs/svelte/issues/15398)
- [svelte-persisted-store Svelte 5 discussion](https://github.com/joshnuss/svelte-persisted-store/discussions/251)
- [shadcn-svelte Svelte 5 migration](https://www.shadcn-svelte.com/docs/migration/svelte-5)

---
*Research completed: 2026-04-02*
*Ready for roadmap: yes*
