# Technology Stack

**Project:** Diddl Manager — catalog browser + collection list manager
**Researched:** 2026-04-02
**Mode:** Brownfield additive — existing stack is locked, research covers what to add

---

## Locked Stack (Already Installed)

These are non-negotiable. Do not substitute.

| Technology | Installed Version | Role |
|---|---|---|
| SvelteKit | 2.55.0 | Full-stack framework, routing, SSR |
| Svelte | 5.53.11 | UI framework — Runes mode |
| Convex | 1.33.0 | Database, reactive queries, file storage, serverless functions |
| convex-svelte | 0.0.12 | Svelte bindings for Convex (`useQuery`, `useConvexClient`) |
| convex-helpers | 0.1.114 | Custom Convex function wrappers (`customQuery`, `customMutation`, `customAction`) |
| Effect | 4.0.0-beta.31 | Backend error handling and service composition |
| @effect/platform-node | 4.0.0-beta.31 | Node.js services layer for Effect |
| Clerk | 6.3.0 (clerk-js) | Authentication, session management |
| Tailwind CSS | 4.2.1 | Utility-first styling |
| @tailwindcss/typography | 0.5.19 | Prose styling (admin markdown, descriptions) |
| TypeScript | 5.9.3 | Type safety |
| Vite | 7.3.1 | Build tool |
| Bun | (runtime) | Package manager and runtime |

---

## Additions Needed

### 1. Persistent Guest State (localStorage)

**Add: `runed` ^0.37.1**

`runed` is the idiomatic Svelte 5 utility library from the Svelte ecosystem (svecosystem). Its `PersistedState` primitive is a runes-native localStorage/sessionStorage wrapper with cross-tab sync and custom serializers. It is built specifically for Svelte 5 runes mode.

Do NOT use:
- `svelte-persisted-store` — the maintainer confirmed it does not feel idiomatic in a runes world and the Svelte 5 path is officially unsettled (see GitHub discussion #251)
- Manual `localStorage` reads in `$effect` — works but duplicates what `runed` provides cleanly

**Why runed specifically:** It ships `PersistedState`, `useIntersectionObserver`, and other primitives that will be needed across phases. One dep instead of three.

**Confidence:** MEDIUM — verified `runed` is actively maintained (0.37.1, published ~3 months ago per npm), Svelte 5 compatibility confirmed from official source.

```bash
bun add runed
```

**Usage pattern for guest lists:**
```typescript
// guest-lists.svelte.ts
import { PersistedState } from 'runed';

const guestLists = new PersistedState('diddl-guest-lists', [] as GuestList[]);
```

---

### 2. Catalog Pagination (Convex-side cursor pagination)

**Add: Nothing — use existing `convex-helpers` + manual cursor state**

`convex-svelte` has no `usePaginatedQuery` (that hook is React-only). The pattern for Svelte is:

1. Define a backend query using `paginationOptsValidator` from `convex/server` and `.paginate(paginationOpts)` — this is built into Convex core.
2. On the client, manage a `$state` cursor and call `useQuery` with `{ cursor, numItems: 100 }`.
3. Append pages to a local array when cursor changes.

The catalog is browsed by type in ranges of 100. This maps naturally to keyset pagination: one `useQuery` per range (e.g., "A4 items 1-100") with a static cursor. No infinite scroll pagination library is needed — the sidebar drives which range is displayed and the range is small enough to render directly.

**Confidence:** HIGH — confirmed Convex pagination API from official docs; confirmed `convex-svelte` has no built-in pagination from GitHub repo inspection.

---

### 3. Image Lazy Loading (10k catalog images)

**Add: `runed` `useIntersectionObserver` (already included above) — no additional dep needed**

Convex `storage.getUrl()` returns a URL derived from a storage ID. URLs are generated inside queries — store the `storageId` in the catalog document, resolve to URL in the query result. URLs are stable per storage ID (the URL won't change on each request per Convex documentation), so no re-fetching concern.

**Pattern:** Native `loading="lazy"` on `<img>` tags plus a Svelte action using `IntersectionObserver` to defer URL resolution for off-screen items. Use `runed`'s `useIntersectionObserver` for the action. No third-party image CDN needed for ~10k images at catalog scale.

Do NOT add:
- Cloudinary or similar — overkill, adds cost and vendor lock-in for a catalog this size
- `@sveltejs/enhanced-img` — only for static/build-time images, not Convex storage URLs

**Confidence:** MEDIUM — Convex URL stability confirmed from stack.convex.dev; lazy loading pattern verified from Svelte community sources.

---

### 4. CSV/JSON Bulk Import (Admin)

**Add: `papaparse` ^5.5.3**

Used for the admin bulk import feature. PapaParse is the de facto standard for browser and Node CSV parsing — 5M weekly downloads, no dependencies, RFC 4180 compliant, supports streaming for large files.

For JSON import, no library is needed — native `JSON.parse` is sufficient and SvelteKit handles multipart form data for file uploads via form actions.

Do NOT use:
- `csv-parse` — Node-only, requires stream setup; PapaParse works in both browser and server
- `svelte-csv` — thin wrapper, adds a dep without meaningful benefit over PapaParse directly

**Confidence:** HIGH — version 5.5.3 confirmed current from npm data.

```bash
bun add papaparse
bun add -D @types/papaparse
```

---

### 5. Schema Validation (Zod)

**Add: `zod` ^4.3.6**

Zod is already used in `models/` (diddl-models.ts, list-models.ts, profile-models.ts) but is not a direct dependency in `package.json` — it is currently riding as a transitive dep of `convex-helpers`. This is fragile. Add it as a direct dependency.

Zod 4 (stable as of 2025, current version 4.3.6) is a major rewrite with significantly improved performance. The `models/` files use `z.enum`, `z.object`, `z.string`, `z.date`, `z.array` — all fully compatible with v4. The existing `convex-helpers` peer dep explicitly supports `^3.25.0 || ^4.0.0`.

Do NOT stay on the implicit v3 transitive — Zod 4 is stable and current.

**Confidence:** HIGH — version confirmed from npm; v4 stability confirmed from official zod.dev/v4.

```bash
bun add zod
```

---

### 6. Virtual Scrolling (Catalog Grid)

**Assessment: Defer — likely NOT needed**

The catalog is paginated by type-range (groups of ~100 items per sidebar selection). At 100 items rendered as image cards, standard DOM rendering is well within browser limits. Virtual scrolling adds component complexity, SSR complications, and accessibility issues for a grid layout.

If a single pane ever needs to render 500+ items simultaneously, revisit `@humanspeak/svelte-virtual-list` (Svelte 5 runes/snippets native, actively maintained). The `@sveltejs/svelte-virtual-list` official package does NOT have Svelte 5 runes support.

**Confidence:** HIGH — confirmed pagination strategy from PROJECT.md; confirmed library compatibility from GitHub issues.

---

### 7. UI Components (shadcn-svelte)

**Assessment: Optional, add only if needed per component**

shadcn-svelte has a Svelte 5 migration path but was still resolving `$$restProps` runes mode issues as of March 2025. The existing codebase uses raw Tailwind with no component library, which is a valid and consistent pattern. Adding shadcn-svelte mid-project creates a mixed style.

**Decision: Do not add as a baseline dependency.** Build UI components with Tailwind directly, consistent with the existing conferences demo. If a complex interactive component is needed (date picker, combobox, dialog), evaluate shadcn-svelte at that point.

**Confidence:** MEDIUM — runes compatibility status from GitHub issues (#493, discussions #829).

---

## Complete Recommended Installation

```bash
# New direct dependencies to add
bun add runed zod papaparse
bun add -D @types/papaparse
```

---

## Full Stack Reference

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | SvelteKit | 2.55.0 | Locked |
| UI | Svelte 5 (Runes) | 5.53.11 | Locked |
| Styling | Tailwind CSS v4 | 4.2.1 | Locked |
| Database | Convex | 1.33.0 | Locked |
| Realtime bindings | convex-svelte | 0.0.12 | Locked |
| Convex utilities | convex-helpers | 0.1.114 | Locked |
| Auth | Clerk (clerk-js) | 6.3.0 | Locked |
| Backend composition | Effect v4 | 4.0.0-beta.31 | Locked |
| Node services | @effect/platform-node | 4.0.0-beta.31 | Locked |
| Validation schemas | Zod | ^4.3.6 | **ADD** |
| Guest persistence | runed (PersistedState) | ^0.37.1 | **ADD** |
| CSV parsing | papaparse | ^5.5.3 | **ADD** |
| Image storage | Convex file storage | built-in | storageId in schema, getUrl() in queries |
| Pagination | Convex built-in `.paginate()` | built-in | Manual cursor state in Svelte |
| Image lazy load | Native `loading="lazy"` + IntersectionObserver (runed) | — | No extra dep needed |
| Deployment | Vercel (@sveltejs/adapter-vercel) | 6.3.3 | Locked |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|---|---|---|---|
| Guest state | runed PersistedState | svelte-persisted-store | Not runes-idiomatic; maintainer unresolved on Svelte 5 path |
| Guest state | runed PersistedState | svelte-persisted-state | Less ecosystem traction; runed covers more use cases |
| CSV parsing | papaparse | csv-parse | Node-only; requires stream boilerplate |
| Virtual scroll | Deferred | @humanspeak/svelte-virtual-list | Not needed at 100-item page sizes |
| UI components | Raw Tailwind | shadcn-svelte | Runes mode issues as of early 2025; inconsistent with existing code |
| Image CDN | Convex native storage | Cloudinary/R2 | 10k static catalog images don't need image transformation pipeline |

---

## Key Architectural Notes for Roadmap

**Convex pagination pattern (client side):**
- `convex-svelte` has `useQuery` only — no `usePaginatedQuery`
- Implement cursor pagination manually: `$state` cursor, accumulate pages in an array
- For the sidebar-range pattern (each range = one discrete query), use independent `useQuery` calls per range — simpler than cursor management and each range is small

**Image URL pattern:**
- Store `storageId: v.id('_storage')` in catalog documents
- Resolve to URL inside the Convex query using `ctx.storage.getUrl(storageId)`
- Return URL alongside catalog data — client receives ready-to-use `<img src>` URLs
- Do NOT store raw URLs in the database — storage IDs are the stable reference

**Guest migration pattern:**
- Guest data lives in `runed` `PersistedState` under a namespaced key
- On Clerk `signIn` event, read local state, batch-write to Convex, clear local state
- The migration runs once, inside the Clerk auth listener already present in `clerk.svelte.ts`

**Zod in models vs Convex schema:**
- Keep Zod schemas in `models/` for client-side validation and TypeScript inference
- Convex schema uses `v.` validators (Convex's own system) — do NOT try to bridge Zod to Convex validators
- The two systems coexist: Zod for form validation and type inference, `v.` validators for Convex schema definition

---

## Sources

- Convex file storage docs: https://docs.convex.dev/file-storage/serve-files
- Convex pagination docs: https://docs.convex.dev/database/pagination
- Convex pagination deep dive: https://stack.convex.dev/pagination
- convex-svelte repo (no usePaginatedQuery): https://github.com/get-convex/convex-svelte
- runed PersistedState: https://runed.dev/docs/utilities/persisted-state
- runed GitHub: https://github.com/svecosystem/runed
- PapaParse npm: https://www.npmjs.com/package/papaparse
- Zod v4 release: https://zod.dev/v4
- shadcn-svelte Svelte 5 migration: https://www.shadcn-svelte.com/docs/migration/svelte-5
- @humanspeak/svelte-virtual-list: https://github.com/humanspeak/svelte-virtual-list
- svelte-persisted-store Svelte 5 discussion: https://github.com/joshnuss/svelte-persisted-store/discussions/251
