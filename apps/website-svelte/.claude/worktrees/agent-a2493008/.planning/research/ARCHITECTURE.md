# Architecture Patterns

**Domain:** Collectible catalog browser + personal collection manager
**Project:** Diddl Manager
**Researched:** 2026-04-02
**Overall confidence:** HIGH (existing stack is established and inspected; Convex docs verified)

---

## Existing Foundation (Do Not Re-architect)

The following infrastructure is already wired and working. Every architectural decision below builds on top of it — it is not replaced.

| Layer                 | Mechanism                                                                          | Status  |
| --------------------- | ---------------------------------------------------------------------------------- | ------- |
| Auth identity         | Clerk (`ClerkStore` Svelte 5 rune class)                                           | Working |
| Auth guard (client)   | `authedQuery/Mutation/Action` via Clerk JWT in Convex context                      | Working |
| Auth guard (server)   | `ClerkService.validateAuth` Effect layer                                           | Working |
| Convex client queries | `useQuery` from `convex-svelte`                                                    | Working |
| Convex server calls   | `ConvexPrivateService` Effect layer                                                | Working |
| Error handling        | Tagged `ConvexError` / `ClerkError` / `GenericError` propagated via `effectRunner` | Working |
| Svelte 5 state        | Runes (`$state`, `$effect`, `$props`)                                              | Working |
| Route wrapping        | `ClerkWrapper` + `ConvexWrapper` in `/app` layout                                  | Working |

---

## Recommended Architecture

### High-Level Component Map

```
Browser
  └─ SvelteKit Route (SSR shell + client hydration)
       ├─ +layout.svelte  (/app)
       │     ClerkWrapper → ConvexWrapper → {children}
       │
       ├─ Catalog Routes  (/app/catalog/[type]/[range])
       │     CatalogSidebar (type tree + range links)
       │     CatalogGrid (paginated items + images)
       │     CatalogItemCard (image, name, type, add-to-list action)
       │
       ├─ List Routes  (/app/lists, /app/lists/[id])
       │     ListsSidebar (user's lists)
       │     ListDetail (items, condition, count, complete toggle)
       │     GuestListStore (localStorage-backed, same interface)
       │
       ├─ Auth Route  (/app/auth)
       │     Clerk SignIn/SignUp mount point
       │     Post-signup migration trigger
       │
       ├─ Profile Route  (/app/profile)
       │     ProfileForm (name, bio, hobbies, picture)
       │
       └─ Admin Routes  (/app/admin)  [role-gated]
             AdminCatalogTable (CRUD individual items)
             AdminBulkImport (CSV/JSON upload → Convex action)
             AdminImageManager (upload URL → storage ID → catalog record)
             AdminTypeManager (DiddlType CRUD)

Convex Backend
  ├─ authed/  (called from browser, Clerk JWT protected)
  │     catalog.ts  (queries: listByTypeRange, getItem)
  │     lists.ts    (CRUD: create, rename, delete, list)
  │     listItems.ts (add, remove, updateCondition, updateCount, toggleComplete, duplicate)
  │     profile.ts  (get, upsert)
  │     migration.ts (importGuestData mutation)
  │
  └─ private/  (called from SvelteKit server, CONVEX_PRIVATE_BRIDGE_KEY protected)
        admin.ts   (bulkImportCatalog action, manageDiddlTypes, catalogCRUD)
        images.ts  (generateUploadUrl action, attachImageToItem mutation)

SvelteKit Server (+page.server.ts / +server.ts)
  └─ Admin upload endpoints (Effect + ConvexPrivateService)
       ─ Validates Clerk session
       ─ Calls private Convex actions for bulk import
       ─ Parses CSV/JSON, streams records in batches
```

---

## Component Boundaries

### Catalog Layer

| Component         | Responsibility                                                                                                  | Talks To                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `CatalogSidebar`  | Renders type → range tree; generates navigation links; no data fetching                                         | Route params only                   |
| `CatalogGrid`     | Fetches one range page (e.g. A4 1-100) via `useQuery`; renders `CatalogItemCard` list; handles pagination state | `authed/catalog` Convex query       |
| `CatalogItemCard` | Displays item image (via Convex storage URL), name, type number; emits "add to list" event                      | Parent (`CatalogGrid`)              |
| `AddToListModal`  | Shows user's lists; calls `listItems.add` mutation                                                              | `authed/lists` + `authed/listItems` |

**Boundary rule:** `CatalogSidebar` is pure navigation — it never fetches. URL params drive what `CatalogGrid` fetches. This keeps the sidebar fast and re-renderable without data waterfalls.

### List Layer

| Component               | Responsibility                                                                                      | Talks To                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `ListStore` (interface) | Abstract CRUD for lists and list items                                                              | Either `GuestListStore` or `ConvexListStore` |
| `GuestListStore`        | Svelte 5 rune class; persists to localStorage; matches `ListStore` interface                        | `localStorage` only                          |
| `ConvexListStore`       | Svelte 5 rune class; calls `useQuery` + `useConvexClient().mutation`; matches `ListStore` interface | `authed/lists`, `authed/listItems`           |
| `ListsSidebar`          | Renders user's list names + colors; links to detail pages                                           | `ListStore`                                  |
| `ListDetail`            | Items with condition, count, complete toggle, duplicate, remove                                     | `ListStore`                                  |

**Boundary rule:** `ListStore` interface is the seam for guest-to-auth migration. Components never care which store they talk to. The switchover happens in one place when auth state changes.

### Auth / Migration Layer

| Component                | Responsibility                                                                                               | Talks To                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| `ClerkStore` (existing)  | Holds `currentUser`, `currentSession`, `isClerkLoaded`                                                       | Clerk JS                                    |
| Auth route (`/app/auth`) | Mounts Clerk SignIn/SignUp UI                                                                                | `ClerkStore`                                |
| `MigrationService`       | Reads guest data from localStorage; calls `authed/migration.importGuestData`; clears localStorage on success | `GuestListStore`, `authed/migration` Convex |
| `AuthStateWatcher`       | `$effect` in root layout; watches `clerkContext.currentUser`; triggers `MigrationService` on first sign-in   | `ClerkStore`, `MigrationService`            |

### Admin Layer

| Component           | Responsibility                                                              | Talks To                                        |
| ------------------- | --------------------------------------------------------------------------- | ----------------------------------------------- |
| `AdminCatalogTable` | Paginated table of all catalog items; inline edit/delete                    | `private/admin` via SvelteKit `+page.server.ts` |
| `AdminBulkImport`   | File input (CSV/JSON); submits to SvelteKit action endpoint; shows progress | `+server.ts` admin endpoint                     |
| `AdminImageManager` | Per-item image upload; shows current image; replaces storage ID             | Convex `storage.generateUploadUrl` flow         |
| `AdminTypeManager`  | Add/rename/disable `DiddlType` enum values                                  | `private/admin`                                 |

---

## Data Flow

### Catalog Browse Flow

```
User clicks "A4 1-100" in sidebar
  → SvelteKit navigates to /app/catalog/A4/1-100
  → CatalogGrid mounts, calls:
      useQuery(api.authed.catalog.listByTypeRange, { type: "A4", start: 1, end: 100 })
  → Convex query runs:
      db.query("catalog")
        .withIndex("by_type_number", q => q.eq("type","A4").gte("number",1).lte("number",100))
        .collect()  // max 100 items, bounded by range
      For each item: ctx.storage.getUrl(item.storageId)  → image URL
  → Results stream back reactively to CatalogGrid
  → CatalogItemCard renders <img src={item.imageUrl} />
```

**Note:** No cursor pagination needed for catalog. Ranges are bounded to 100 items by the sidebar navigation design. A Convex index on `(type, number)` makes each range query O(range_size), not O(10k).

### Guest List Flow

```
Guest visits /app/lists
  → AuthStateWatcher sees currentUser === null
  → ListStore context = GuestListStore instance
  → All list CRUD reads/writes to localStorage
  → Data shape: { lists: List[], listItems: ListItem[] }
    stored as "diddl_guest_lists" and "diddl_guest_list_items" keys
```

### Guest-to-Auth Migration Flow

```
Guest clicks "Sign Up" → Clerk modal appears
  → On successful sign-in, ClerkStore emits currentUser
  → AuthStateWatcher $effect fires:
      1. Check localStorage for guest data
      2. If data exists, call MigrationService.migrate()
         → Reads all guest lists + list items from localStorage
         → Calls authed/migration.importGuestData({ lists, listItems })
         → Convex mutation: batch-inserts all lists and list items
           under the authenticated user's identity
      3. On success: clear localStorage guest keys
      4. Switch ListStore context to ConvexListStore
  → User sees their data intact, now cloud-backed
```

**Key design:** Migration is idempotent. `importGuestData` checks for existing lists by name+createdAt before inserting to prevent duplicate migration on double-fire.

### Admin Bulk Import Flow

```
Admin uploads CSV file in AdminBulkImport
  → Browser POSTs FormData to /app/admin/import (SvelteKit +server.ts)
  → Server-side Effect pipeline:
      1. ClerkService.validateAuth → confirm admin role
      2. Parse CSV in chunks of 100 records
      3. For each chunk: ConvexPrivateService.action({
           func: api.private.admin.bulkImportChunk,
           args: { records: chunk }
         })
      4. Stream progress back via SSE or return counts
  → Convex private action: batch-inserts catalog items
    (skips existing by diddl number+type to allow re-import)
```

**Key design:** Chunking at 100 records avoids Convex mutation time limits and keeps each action under the function execution budget. CLI import (`npx convex import`) is available for initial seed of the full 10k dataset but cannot be used programmatically at runtime.

### Image Upload Flow

```
Admin uploads image for a catalog item
  → AdminImageManager calls:
      POST /app/admin/upload-url (SvelteKit +server.ts)
        → ConvexPrivateService.action: api.private.images.generateUploadUrl
        → Returns { uploadUrl, storageId }
  → Browser POSTs image file directly to uploadUrl (Convex storage)
  → AdminImageManager calls:
      ConvexClient.mutation(api.authed.admin.attachImageToItem, {
        catalogItemId, storageId
      })
  → Catalog item document updated with storageId
  → Catalog queries now return ctx.storage.getUrl(storageId)
```

---

## Convex Schema Design

```typescript
// catalog
defineTable({
	type: v.string(), // DiddlType enum value
	number: v.number(), // item number within type
	name: v.string(),
	edition: v.string(),
	releaseDate: v.number(), // Unix ms
	storageId: v.optional(v.id('_storage')), // primary image
	imageWidth: v.optional(v.number()),
	imageHeight: v.optional(v.number())
	// future: v.array(v.id("_storage")) for multi-image
})
	.index('by_type_number', ['type', 'number'])
	.index('by_type', ['type']);

// lists
defineTable({
	userId: v.string(), // Clerk identity subject
	name: v.string(),
	description: v.string(),
	color: v.string(),
	createdAt: v.number(),
	updatedAt: v.number(),
	deletedAt: v.optional(v.number())
})
	.index('by_user', ['userId'])
	.index('by_user_name', ['userId', 'name']);

// listItems
defineTable({
	listId: v.id('lists'),
	catalogItemId: v.id('catalog'),
	condition: v.union(
		v.literal('mint'),
		v.literal('lightly used'),
		v.literal('used'),
		v.literal('damaged')
	),
	tags: v.array(v.string()),
	isComplete: v.boolean(),
	quantity: v.number()
})
	.index('by_list', ['listId'])
	.index('by_list_item', ['listId', 'catalogItemId']);

// profiles
defineTable({
	userId: v.string(),
	name: v.string(),
	birthdate: v.optional(v.number()),
	description: v.string(),
	hobbies: v.string(),
	pictureStorageId: v.optional(v.id('_storage')),
	createdAt: v.number(),
	updatedAt: v.number(),
	deletedAt: v.optional(v.number())
}).index('by_user', ['userId']);
```

---

## Suggested Build Order

Dependencies between components make this the correct sequence:

### Phase 1: Schema + Catalog Foundation

**Build first because everything else reads from it.**

1. Replace placeholder Convex schema with `catalog`, `lists`, `listItems`, `profiles` tables
2. Run `bun run convex:gen` to regenerate API types
3. Build `authed/catalog.ts` — `listByTypeRange` query (uses `by_type_number` index)
4. Build `CatalogSidebar` — static type tree + range links, no data fetching
5. Build `CatalogGrid` + `CatalogItemCard` — `useQuery` for one range, image display via `ctx.storage.getUrl`

**Gate:** Catalog must be browsable before lists are useful.

### Phase 2: Guest List Mode

**Build against localStorage before Convex to validate the data model independently.**

1. Define `ListStore` interface (TypeScript)
2. Build `GuestListStore` (Svelte 5 rune class, localStorage)
3. Build `ListsSidebar` + `ListDetail` against `GuestListStore`
4. Wire guest store into app via Svelte context
5. Test full list CRUD without auth

**Gate:** Guest lists must be stable before migration code is written.

### Phase 3: Auth + Migration

**Layer auth on top of the working guest system.**

1. Build `/app/auth` route (Clerk mount point)
2. Build `ConvexListStore` (same interface as `GuestListStore`, uses Convex)
3. Build `authed/lists.ts` and `authed/listItems.ts` Convex functions
4. Build `authed/migration.ts` — `importGuestData` mutation (idempotent)
5. Build `AuthStateWatcher` in root layout — switches ListStore context, triggers migration
6. Wire `MigrationService` end-to-end

**Gate:** Catalog + guest lists must exist before migration has anything to migrate.

### Phase 4: Profile

**Standalone, no dependencies on list or catalog logic.**

1. Build `authed/profile.ts` — `get` and `upsert` queries/mutations
2. Build `/app/profile` route with `ProfileForm`
3. Wire picture upload through Convex storage

### Phase 5: Admin

**Build last — requires full schema and image storage pattern.**

1. Build role-checking in `authed` helpers (Clerk custom role or metadata)
2. Build `/app/admin` route shell with role gate
3. Build `AdminCatalogTable` — individual CRUD
4. Build `private/admin.ts` — `bulkImportChunk` action
5. Build `AdminBulkImport` — CSV/JSON parse + chunked server-side import
6. Build `AdminImageManager` — upload URL flow
7. Build `AdminTypeManager`

---

## Key Architectural Decisions

### No cursor pagination for catalog browsing

The sidebar navigation divides the catalog into ranges of 100 items by design. A `by_type_number` Convex index makes each range query a bounded O(100) scan. `usePaginatedQuery` is not needed and adds complexity for no gain. If a type has more than 100 items in a range, subdivide the range in the sidebar tree — this is a navigation UX decision, not a pagination problem.

**Confidence:** HIGH — verified Convex index behavior; convex-svelte has no `usePaginatedQuery` equivalent, confirmed in docs.

### ListStore interface as the guest/auth seam

Rather than sprinkling `if (isGuest)` checks throughout list components, a single abstract `ListStore` interface lets components remain identical. The Svelte context that provides `ListStore` is swapped atomically on migration. This pattern avoids conditional data paths in UI components.

**Confidence:** HIGH — standard strategy pattern, well-proven in frontend collection management.

### Server-side chunked bulk import (not CLI)

`npx convex import` is a CLI-only tool; it cannot be called programmatically from the app at runtime. Admin bulk import must go through a private Convex action called from the SvelteKit server. Chunking at ~100 records per action call respects Convex's function execution limits.

**Confidence:** HIGH — verified in Convex import docs; CLI restriction confirmed.

### Image storage via Convex `storage.generateUploadUrl` + `ctx.storage.getUrl`

Convex file storage is already the mandated choice. The URL-based upload flow (generate URL → POST file directly → save storage ID) supports unlimited file sizes. Image URLs are generated at query time by `ctx.storage.getUrl(storageId)` and returned alongside catalog data — no separate image endpoint needed.

**Confidence:** HIGH — verified in Convex file storage docs.

### Admin role gating via Clerk metadata

Clerk supports `publicMetadata.role` on user records. The `authedQuery/Mutation/Action` helpers already extract identity from `ctx.auth.getUserIdentity()`. Admin guards check `identity.publicMetadata.role === "admin"` rather than maintaining a separate admin users table.

**Confidence:** MEDIUM — Clerk supports custom metadata; exact field path in Convex `getUserIdentity()` result needs verification during implementation.

---

## Scalability Considerations

| Concern             | Current scale (~10k items)                | At 100k items                                                     |
| ------------------- | ----------------------------------------- | ----------------------------------------------------------------- |
| Catalog queries     | Index scan of ≤100 items per range — fine | Still fine; index makes it O(range) not O(table)                  |
| Image serving       | Convex CDN-backed storage URLs            | Move to Cloudflare R2 component if costs become concern           |
| List items per user | Typically < 1000 items                    | Add `by_list_updated` index if ordering becomes slow              |
| Bulk import         | 100-record chunks via private action      | Consider pre-seeding via `npx convex import` CLI for initial load |
| Admin table         | All catalog items paginated server-side   | Add admin-specific paginated query with `by_type` index           |

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: `.filter()` instead of `.withIndex()` on catalog queries

**What goes wrong:** `db.query("catalog").filter(q => q.eq(q.field("type"), "A4"))` does a full table scan of all 10k items.
**Instead:** Always use `.withIndex("by_type_number", ...)` to scope to the relevant range.

### Anti-Pattern 2: Calling `ctx.storage.getUrl` outside a Convex query

**What goes wrong:** Storage URLs are generated server-side in Convex queries/mutations/actions. You cannot call `getUrl` from the SvelteKit client directly.
**Instead:** Return URLs from the catalog query alongside item data. Cache them via Convex's reactive query layer.

### Anti-Pattern 3: Running guest-to-auth migration on every page load

**What goes wrong:** `$effect` watching `currentUser` fires on every re-render, triggering duplicate migration calls.
**Instead:** Track a `hasMigrated` flag in the Svelte session (not localStorage — it would be cleared). Check for guest data presence before triggering migration. Make the Convex mutation idempotent as a safety net.

### Anti-Pattern 4: Storing `listId` as a plain string in localStorage guest data

**What goes wrong:** When migrating to Convex, guest `listId` (a local integer) collides with Convex document IDs (opaque strings). List items reference the wrong lists post-migration.
**Instead:** Guest list items reference guest list IDs by a local UUID generated at creation time. The migration mutation creates new Convex documents and re-maps the ID references atomically.

### Anti-Pattern 5: Bulk import as a single large Convex mutation

**What goes wrong:** Convex mutations have execution time limits. 10k records in one mutation will timeout.
**Instead:** Chunk at 100 records per action invocation, called sequentially from the SvelteKit server endpoint.

---

## Sources

- [Convex Paginated Queries](https://docs.convex.dev/database/pagination) — HIGH confidence
- [Convex Queries That Scale](https://stack.convex.dev/queries-that-scale) — HIGH confidence
- [Convex File Storage: Upload Files](https://docs.convex.dev/file-storage/upload-files) — HIGH confidence
- [Convex File Storage: Serve Files](https://docs.convex.dev/file-storage/serve-files) — HIGH confidence
- [Convex Data Import](https://docs.convex.dev/database/import-export/import) — HIGH confidence (CLI-only confirmed)
- [convex-svelte GitHub](https://github.com/get-convex/convex-svelte) — HIGH confidence (no usePaginatedQuery confirmed)
- [Convex Svelte Docs](https://docs.convex.dev/client/svelte) — HIGH confidence
- Existing codebase inspection (`src/convex/`, `src/lib/`, `models/`) — HIGH confidence
