# Phase 1: Schema + Catalog - Research

**Researched:** 2026-04-02
**Domain:** Convex schema design, seeding, catalog browsing UI (SvelteKit + Svelte 5 + shadcn-svelte)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from additional_context / STATE.md)

### Locked Decisions
- Use shadcn-svelte as component library (accordion, badge, card components)
- Catalog data seeded from `./catalog.json` at project root; actual images added later (use placeholder)
- Convex storage for images (storageId in schema, URL resolved at query time)
- Compound index on (type, number) for efficient range queries
- Stone theme for shadcn-svelte

### Claude's Discretion
- Route structure for the catalog page (`/app/catalog` is the natural choice; planner decides)
- Number extraction strategy from catalog.json filenames (SB0001.jpg -> 1; pani_001_sticker.jpg -> 1; etc.)
- How to handle items without extractable numbers (assign sequential index at seed time)
- Sidebar URL state mechanism (search params vs. route params — search params are simpler for Phase 1)

### Deferred Ideas (OUT OF SCOPE)
- LIST-01 through LIST-12 (list management) — Phase 2
- AUTH-01 through AUTH-05 (authentication) — Phase 3
- PROF-01 through PROF-02 (profile) — Phase 4
- ADMN-01 through ADMN-05 (admin) — Phase 5
- Multi-image UI — Phase 5+ (schema must be future-ready but no UI)
- CATL-04 completion percentage badges — requires list data from Phase 2; Phase 1 delivers scaffold only (badge renders but shows placeholder/zero until Phase 2 data exists)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | Convex schema: catalog items with type, name, edition, release date, storageId | Schema pattern section; catalog.json analysis confirms available fields |
| DATA-02 | Convex schema: lists with name, description, color, ownership | Schema declared now so Phase 2 can use it; no UI in Phase 1 |
| DATA-03 | Convex schema: list items with condition, quantity, complete flag, tags | Schema declared now; no UI in Phase 1 |
| DATA-04 | Convex schema: user profiles with name, bio, hobbies, picture | Schema declared now; no UI in Phase 1 |
| DATA-05 | Convex schema: DiddlTypes as managed collection (not hardcoded enum) | Separate `diddlTypes` table pattern documented |
| DATA-06 | Compound index on catalog items (type, number) | Index definition pattern documented; MUST exist before any query |
| DATA-07 | Schema supports multiple images per catalog item (storageId array) | `v.array(v.id('_storage'))` pattern documented |
| CATL-01 | Browse catalog by type via nested sidebar (type → number ranges of 100) | Sidebar tree structure, URL search params, accordion pattern |
| CATL-02 | Catalog item cards with images from Convex storage | `ctx.storage.getUrl(storageId)` pattern; placeholder for Phase 1 |
| CATL-03 | Images lazy-load for performance | `runed` `useIntersectionObserver` + native `loading="lazy"` pattern |
| CATL-04 | Sidebar shows completion percentage per type/range when authenticated | Scaffold only in Phase 1 — badge component exists, shows placeholder until Phase 2 list data available |
</phase_requirements>

---

## Summary

Phase 1 replaces the placeholder `conferences` schema with the full Diddl domain model and delivers a browsable catalog UI. The schema work covers all five tables (catalogItems, diddlTypes, lists, listItems, userProfiles) even though only catalog and diddlTypes are used in Phase 1 UI — getting all tables defined now avoids schema migrations later.

The catalog.json at the project root contains 3,913 items across 27 types. It has no `number`, `edition`, or `release_date` fields — these must be derived during seeding. The `number` field is extractable from filenames (SB0001.jpg → 1, pani_001_sticker.jpg → 1) for items with numeric names; items without parseable numbers receive a sequential index at seed time. The `edition` and `release_date` fields should be declared optional in the schema so seeding works without them. Images are not present in Convex storage yet — storageId array in the schema is future-ready but all cards render the placeholder in Phase 1.

shadcn-svelte is not yet initialized. Initializing it with `npx shadcn-svelte@latest init` and selecting the stone theme is a mandatory Wave 0 task before any component code. The three required components (accordion, badge, card) are then added via `npx shadcn-svelte@latest add`. The `runed` package must also be installed via `bun add runed` — it is not yet in package.json.

**Primary recommendation:** Define schema first (with all tables + compound index), seed catalog data from catalog.json via a private Convex action, then build the sidebar + grid UI using shadcn-svelte components and `useQuery` with the `by_type_number` index.

---

## Catalog.json Analysis

This is critical input for the schema and seeding tasks.

### Data Shape

The file at `./catalog.json` (project root, relative to `website-svelte/`) contains **3,913 items** across **27 types**. Fields present:

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Filename like `SB0001.jpg` — used to derive `number` |
| `type` | string | One of 27 type slugs (e.g., `"A4"`, `"sticker"`, `"series"`) |
| `imagePath` | string | Relative path from image root — not used in Phase 1 (images not yet in Convex storage) |
| `imageWidth` | number | Original pixel width |
| `imageHeight` | number | Original pixel height |

**No `number`, `edition`, or `release_date` fields exist in the JSON.** These must be handled at schema design time.

### Number Extraction Strategy

Items names follow several patterns:

| Pattern | Example | Extracted Number |
|---------|---------|-----------------|
| Prefixed zero-padded | `SB0001.jpg` | 1 |
| Prefixed underscore-padded | `pani_001_sticker.jpg` | 1 (first number group) |
| Bare number | (rare) | direct parse |
| No number | `stickers.jpg`, `GalupyblattohneSchrift.JPG` | assign sequential index (177 items) |

**Strategy:** During seeding, extract the first contiguous digit sequence from the filename (strip extension first). If none found, assign an auto-incrementing index starting from the max extracted number + 1 within the same type.

### Items Per Type (Sidebar Range Count)

| Type | Items | Sidebar Ranges |
|------|-------|---------------|
| A5 | 512 | 6 |
| series | 490 | 5 |
| letter-paper | 469 | 5 |
| sticker | 408 | 5 |
| A6 | 337 | 4 |
| postal-card | 312 | 4 |
| gift-paper | 203 | 3 |
| A4 | 174 | 2 |
| special | 119 | 2 |
| post-it | 116 | 2 |
| paper-bag-A5 | 101 | 2 |
| quardiddl-card | 97 | 1 |
| (15 smaller types) | 9–92 | 1 each |

**Total sidebar range rows across all types:** ~46 range rows + 27 type header rows.

---

## Standard Stack

### Core (already installed — no changes needed)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| Convex | 1.33.0 (installed) / 1.34.1 (latest) | DB, queries, file storage | Schema + indexed queries |
| convex-svelte | 0.0.12 | `useQuery`, `useConvexClient` bindings | Real-time reactive queries |
| convex-helpers | 0.1.114 | `authedQuery`, `privateAction` wrappers | Seeding uses `privateAction` |
| SvelteKit | 2.50.2 | Routing, layouts | Catalog page under `/app/catalog` |
| Svelte 5 | 5.51.0 | Runes, components | `$state`, `$derived`, `$props` |
| TailwindCSS v4 | 4.1.18 | Styling | Stone palette already in use |

### Must Add Before Implementation

| Library | Install Command | Purpose | Confidence |
|---------|----------------|---------|------------|
| `runed` | `bun add runed` | `useIntersectionObserver` for lazy image loading | HIGH — confirmed in research/SUMMARY.md |
| `shadcn-svelte` | `npx shadcn-svelte@latest init` | Accordion, Badge, Card components | HIGH — user decision; version 1.2.7 latest |
| `lucide-svelte` | installed by shadcn-svelte init | Icons (ImageOff for placeholder) | HIGH — shadcn-svelte default |
| `bits-ui` | installed by shadcn-svelte init | shadcn-svelte component primitives | HIGH — shadcn-svelte default |

**Installation sequence:**
```bash
# 1. Add runed
bun add runed

# 2. Initialize shadcn-svelte (interactive — choose stone theme)
npx shadcn-svelte@latest init

# 3. Add required components
npx shadcn-svelte@latest add accordion badge card
```

shadcn-svelte init creates `components.json` and installs `bits-ui` and `lucide-svelte` as dependencies automatically. **Do not write component code before `components.json` exists.**

### Alternatives Not Needed
- `papaparse` — Phase 5 (admin CSV import), not needed here
- `zod` direct dep — not needed for Phase 1 (no form validation)
- Virtual scrolling — sidebar-range design keeps each grid to ~100–512 items; native lazy loading is sufficient

---

## Architecture Patterns

### Recommended Project Structure (Phase 1 additions)

```
src/
├── convex/
│   ├── schema.ts                   # REPLACE — full domain schema (all 5 tables)
│   ├── authed/
│   │   ├── helpers.ts              # unchanged
│   │   ├── catalog.ts              # NEW — list by type+range, getUrl resolution
│   │   └── diddlTypes.ts           # NEW — list all types
│   └── private/
│       ├── helpers.ts              # unchanged
│       └── seed.ts                 # NEW — seed catalog from JSON via privateAction
├── routes/
│   └── app/
│       ├── +layout.svelte          # unchanged
│       └── catalog/
│           └── +page.svelte        # NEW — catalog page
└── lib/
    └── components/
        ├── PageError.svelte        # unchanged
        ├── catalog/
        │   ├── CatalogSidebar.svelte
        │   ├── SidebarTypeRow.svelte
        │   ├── SidebarRangeRow.svelte
        │   ├── CompletionBadge.svelte
        │   ├── CatalogGrid.svelte
        │   ├── CatalogItemCard.svelte
        │   └── LazyImage.svelte
        └── ui/                     # shadcn-svelte generated components land here
            ├── accordion/
            ├── badge/
            └── card/
```

### Pattern 1: Convex Schema with Compound Index

**What:** Define all domain tables in `schema.ts`. The `by_type_number` compound index must be defined before any catalog query is written.

**When to use:** Always — retrofitting an index requires a schema migration.

```typescript
// src/convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  catalogItems: defineTable({
    type: v.string(),          // "A4", "sticker", etc. — matches diddlTypes.slug
    number: v.number(),        // sequential integer extracted from filename
    name: v.optional(v.string()),      // human-readable display name (optional for seeding)
    edition: v.optional(v.string()),   // optional — not present in catalog.json
    releaseDate: v.optional(v.number()), // optional — epoch ms; not present in catalog.json
    imageStorageIds: v.array(v.id('_storage')), // DATA-07: array, future-ready
    imagePath: v.optional(v.string()), // raw path from catalog.json for reference
  })
    .index('by_type_number', ['type', 'number']),  // DATA-06: MUST define before any query

  diddlTypes: defineTable({    // DATA-05: managed collection, not hardcoded enum
    slug: v.string(),          // "A4", "sticker", etc. — matches catalogItems.type
    displayName: v.string(),   // "A4 Sheets", "Stickers", etc.
    sortOrder: v.number(),     // controls sidebar display order
  })
    .index('by_slug', ['slug'])
    .index('by_sort_order', ['sortOrder']),

  lists: defineTable({         // DATA-02: declared now, used in Phase 2
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    ownerSubject: v.string(),  // Clerk identity.subject — NOT email
  })
    .index('by_owner', ['ownerSubject']),

  listItems: defineTable({     // DATA-03: declared now, used in Phase 2
    listId: v.id('lists'),
    catalogItemId: v.id('catalogItems'),
    condition: v.union(
      v.literal('mint'),
      v.literal('near_mint'),
      v.literal('good'),
      v.literal('poor'),
      v.literal('damaged')
    ),
    quantity: v.number(),
    complete: v.boolean(),
    tags: v.array(v.string()),
  })
    .index('by_list', ['listId'])
    .index('by_list_catalog', ['listId', 'catalogItemId']),

  userProfiles: defineTable({  // DATA-04: declared now, used in Phase 4
    ownerSubject: v.string(),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    hobbies: v.array(v.string()),
    pictureStorageId: v.optional(v.id('_storage')),
  })
    .index('by_owner', ['ownerSubject']),
});
```

**Critical:** Run `bun run convex:gen` after any schema change.

### Pattern 2: Catalog Query with by_type_number Index

**What:** Fetch catalog items for a given type and number range using the compound index. Resolve image URLs server-side.

**When to use:** Every catalog grid query — never use `.filter()` for type+number, always use `.withIndex()`.

```typescript
// src/convex/authed/catalog.ts
import { v } from 'convex/values';
import { authedQuery } from './helpers';

export const listByRange = authedQuery({
  args: {
    type: v.string(),
    fromNumber: v.number(),
    toNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query('catalogItems')
      .withIndex('by_type_number', (q) =>
        q.eq('type', args.type).gte('number', args.fromNumber).lte('number', args.toNumber)
      )
      .order('asc')
      .collect();

    // Resolve first image URL for each item; client never calls storage APIs directly
    return await Promise.all(
      items.map(async (item) => {
        const imageUrl =
          item.imageStorageIds.length > 0
            ? await ctx.storage.getUrl(item.imageStorageIds[0])
            : null;
        return { ...item, imageUrl };
      })
    );
  }
});
```

**Why:** `.withIndex('by_type_number', ...)` uses the compound index for O(log n + k) range scan. `.filter()` would scan all 3,913 documents on every query and re-send the full result to all subscribers on any admin edit.

### Pattern 3: DiddlTypes Public Query

Catalog browsing must work for unauthenticated guests in Phase 1 (CATL-01 has no auth requirement). DiddlType list is public catalog metadata.

```typescript
// src/convex/authed/diddlTypes.ts — NOTE: use plain query, not authedQuery
import { query } from '../_generated/server';

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('diddlTypes')
      .withIndex('by_sort_order')
      .order('asc')
      .collect();
  }
});
```

**Important distinction:** `authedQuery` throws if no identity. The catalog must be browsable without auth. Use plain `query()` from `'../\_generated/server'` for the diddlTypes list and catalog item queries so unauthenticated users can browse.

### Pattern 4: Seed via Private Action

**What:** A private action reads catalog.json and bulk-inserts all items and types into Convex. Called once from a SvelteKit server route.

**When to use:** Phase 1 one-time seed; later replaced by admin bulk import in Phase 5.

```typescript
// src/convex/private/seed.ts
import { privateAction } from './helpers';
import { internal } from '../_generated/api';

// Actions can read files bundled with the Convex deployment
// For seeding from catalog.json, pass the data as an argument (chunked)
// to avoid the 8MB action argument limit

export const seedCatalogChunk = privateAction({
  args: {
    items: v.array(v.object({
      type: v.string(),
      number: v.number(),
      imagePath: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.private.seedMutations.insertCatalogChunk, {
      items: args.items
    });
  }
});
```

**Convex action limits (from research/SUMMARY.md):**
- Actions cannot directly write to the database — they must call `ctx.runMutation()`
- Mutations have a 1MB write limit per call; batch in chunks of ~100 items
- Use `internal.*` for mutation calls from actions (not `api.*`)

### Pattern 5: Sidebar URL State via Search Params

**What:** Active range selection stored in URL search params (`?type=A4&from=1&to=100`). Range rows are `<a>` tags with updated search params.

**When to use:** Sidebar navigation — URL state makes the selection shareable, bookmarkable, and survives refresh.

```typescript
// In CatalogGrid or parent page component
const url = $derived(new URL($page.url));
const selectedType = $derived(url.searchParams.get('type') ?? null);
const selectedFrom = $derived(Number(url.searchParams.get('from') ?? 0));
const selectedTo = $derived(Number(url.searchParams.get('to') ?? 99));

// In SidebarRangeRow — construct href
function rangeHref(type: string, from: number, to: number): string {
  return `/app/catalog?type=${encodeURIComponent(type)}&from=${from}&to=${to}`;
}

// Active state check
function isActive(type: string, from: number): boolean {
  return selectedType === type && selectedFrom === from;
}
```

**Use SvelteKit's `$page` store** — import from `$app/stores`. No manual URL parsing needed.

### Pattern 6: useQuery with Reactive Args

**What:** `useQuery` from `convex-svelte` takes a reactive args function. When search params change (type/range selection), the query automatically re-fetches.

```typescript
// In CatalogGrid.svelte or parent page
import { useQuery } from 'convex-svelte';
import { api } from '../../../convex/_generated/api';

// selectedType, selectedFrom, selectedTo are $derived from URL
const catalogQuery = useQuery(
  api.authed.catalog.listByRange,
  // convex-svelte accepts a function for reactive args
  () =>
    selectedType !== null
      ? { type: selectedType, fromNumber: selectedFrom, toNumber: selectedTo }
      : 'skip'
);
```

**`'skip'` pattern:** Passing `'skip'` as args tells convex-svelte not to subscribe when no range is selected (empty state).

### Pattern 7: LazyImage with runed useIntersectionObserver

**What:** Use `runed`'s `useIntersectionObserver` to gate image loading + native `loading="lazy"` as fallback.

```svelte
<!-- LazyImage.svelte -->
<script lang="ts">
  import { useIntersectionObserver } from 'runed';
  import { ImageOff } from 'lucide-svelte';

  let { src, alt }: { src: string | null; alt: string } = $props();

  let imgEl = $state<HTMLImageElement | undefined>();
  let isVisible = $state(false);
  let loaded = $state(false);
  let errored = $state(false);

  useIntersectionObserver(
    () => imgEl,
    (entries) => {
      if (entries[0]?.isIntersecting) {
        isVisible = true;
      }
    }
  );
</script>

<div class="relative h-40 w-full overflow-hidden bg-stone-100">
  {#if !src || errored || (!isVisible && !loaded)}
    <div class="flex h-full items-center justify-center text-stone-300">
      <ImageOff size={32} />
    </div>
  {/if}
  {#if src && isVisible}
    <img
      bind:this={imgEl}
      {src}
      {alt}
      loading="lazy"
      onload={() => (loaded = true)}
      onerror={() => (errored = true)}
      class="h-full w-full object-cover transition-opacity duration-200 {loaded ? 'opacity-100' : 'opacity-0'}"
    />
  {/if}
</div>
```

### Anti-Patterns to Avoid

- **Using `.filter()` for type+range queries** — full table scan on 3,913 items; use `.withIndex('by_type_number', ...)`.
- **Calling `ctx.storage.getUrl()` from client components** — client cannot access storage APIs directly; always resolve in the query handler.
- **Writing mutations directly inside a Convex action** — actions use `ctx.runMutation(internal....)`, not `ctx.db.insert()`.
- **Using `authedQuery` for catalog browsing** — throws for unauthenticated users; use plain `query()` so guests can browse.
- **Hardcoding DiddlTypes as TypeScript enum** — DATA-05 requires managed collection in a `diddlTypes` table; sidebar must derive from DB query not a constant.
- **Module-scoped `$state` for URL/sidebar state** — use `$derived` from `$page.url` or pass via props; module-level `$state` leaks across SSR requests.
- **Storing storageUrl in the schema** — store `storageId`; URL expires and must be resolved at query time via `ctx.storage.getUrl()`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accordion expand/collapse for sidebar | Custom CSS + JS toggle | `shadcn-svelte` Accordion | Keyboard nav, accessibility, animation handled |
| Badge component | Custom `<span>` with inline styles | `shadcn-svelte` Badge | Consistent with design system; adds `class` prop for color overrides |
| Card component | Custom div | `shadcn-svelte` Card | Consistent border/surface/padding tokens |
| Intersection observer | Manual `new IntersectionObserver(...)` | `runed` `useIntersectionObserver` | Svelte 5 lifecycle integration; automatic cleanup |
| URL search param parsing | `window.location.search` | SvelteKit `$page.url.searchParams` | SSR-compatible, reactive, no manual parsing |
| Type list query | `db.query('catalogItems').collect()` + deduplicate | Separate `diddlTypes` table query | O(1) vs O(n); avoids scanning all catalog items to get type list |

**Key insight:** The `diddlTypes` table exists separately from `catalogItems` specifically so the sidebar can load the type tree without scanning 3,913 catalog documents.

---

## Common Pitfalls

### Pitfall 1: Catalog Query Without Index (Full Table Scan)
**What goes wrong:** Using `ctx.db.query('catalogItems').filter(q => q.eq(q.field('type'), 'A4'))` scans all 3,913 items. Every admin edit that touches any item triggers a reactive re-send of the full result to all subscribed clients.
**Why it happens:** Convex `.filter()` does not use indexes.
**How to avoid:** ALWAYS use `.withIndex('by_type_number', q => q.eq('type', ...).gte('number', ...).lte('number', ...))`.
**Warning signs:** Query result set size equals total catalog count, not the range count.

### Pitfall 2: authedQuery Blocks Guest Browsing
**What goes wrong:** If catalog queries use `authedQuery`, unauthenticated users get a 401 exception when visiting `/app/catalog`.
**Why it happens:** `authedQuery` throws if `ctx.auth.getUserIdentity()` is null.
**How to avoid:** Use plain `query()` for catalog list queries and diddlTypes list. Reserve `authedQuery` for mutations and future completion-percentage queries (CATL-04) that require identity.
**Warning signs:** Catalog page throws "Unauthorized" for non-logged-in users.

### Pitfall 3: shadcn-svelte Components Written Before Init
**What goes wrong:** `import { Accordion } from '$lib/components/ui/accordion'` fails with "module not found" because `components.json` and the component files don't exist yet.
**Why it happens:** shadcn-svelte generates component files via the CLI — they are not importable from the npm package directly.
**How to avoid:** `npx shadcn-svelte@latest init` → confirm `components.json` exists → then `npx shadcn-svelte@latest add accordion badge card` → then write component code.
**Warning signs:** Import errors on `$lib/components/ui/...` paths.

### Pitfall 4: Seed Action Exceeds Convex Limits
**What goes wrong:** Passing all 3,913 items as a single action argument or a single mutation write fails silently or errors with payload/write limit exceeded.
**Why it happens:** Convex mutations have a 1MB write limit; actions have an 8MB argument limit.
**How to avoid:** Chunk seed data into batches of 100 items per mutation call. The SvelteKit server route calling the seed action should loop over chunks, calling `privateAction` per chunk.
**Warning signs:** Seed completes with no error but only partial data in DB.

### Pitfall 5: Number Extraction Produces Collisions Within a Type
**What goes wrong:** Two items in the same type extract to the same number (e.g., both `pani_001_sticker.jpg` and `001_sticker_variant.jpg` → 1). The compound index allows duplicates but range queries return unexpected counts.
**Why it happens:** The extraction heuristic is imperfect for files with multiple number groups.
**How to avoid:** During seeding, detect collisions within a type; if a number is already taken, assign the next available sequential integer. Log all collision resolutions.
**Warning signs:** Grid shows fewer items than expected count for a range.

### Pitfall 6: Sidebar Loaded from catalogItems Instead of diddlTypes
**What goes wrong:** Sidebar fetches distinct types by scanning `catalogItems` — this is an O(n) scan of 3,913 items just to render the navigation tree.
**Why it happens:** Tempting shortcut when the type list is not separately stored.
**How to avoid:** Seed 27 records into `diddlTypes` alongside catalog items. Sidebar queries `diddlTypes` only.
**Warning signs:** Sidebar query result shows `collectionName: 'catalogItems'` in Convex dashboard.

### Pitfall 7: Image URL Stored in Schema (Not Storage ID)
**What goes wrong:** Storing an HTTPS URL in the schema means the URL can expire or change when Convex rotates storage URLs. Client-side URL resolution via storage APIs is not available.
**Why it happens:** Seems simpler than the storageId pattern.
**How to avoid:** Store `v.id('_storage')` (storageId), resolve to URL in the query handler via `ctx.storage.getUrl(storageId)`. Phase 1 has no images yet — `imageStorageIds` is an empty array `[]` for all seeded items.
**Warning signs:** `imageStorageIds` field contains a string starting with `https://`.

---

## Code Examples

### Schema Definition (verified pattern from codebase + Convex docs)

```typescript
// Compound index pattern — verified from existing codebase + Convex official docs
.index('by_type_number', ['type', 'number'])

// Array of storage IDs — future-ready for DATA-07
imageStorageIds: v.array(v.id('_storage'))

// Optional fields for catalog seed compatibility
edition: v.optional(v.string())
releaseDate: v.optional(v.number())
```

### useQuery Skip Pattern (convex-svelte)

```typescript
// Pass 'skip' to avoid subscribing when no selection exists
// Source: convex-svelte GitHub README
const query = useQuery(api.authed.catalog.listByRange, () =>
  selectedType !== null
    ? { type: selectedType, fromNumber: selectedFrom, toNumber: selectedTo }
    : 'skip'
);
```

### shadcn-svelte Accordion Usage (after init)

```svelte
<!-- Source: shadcn-svelte official registry -->
<script lang="ts">
  import * as Accordion from '$lib/components/ui/accordion/index.js';
</script>

<Accordion.Root type="multiple">
  <Accordion.Item value="A4">
    <Accordion.Trigger>A4 Sheets</Accordion.Trigger>
    <Accordion.Content>
      <!-- range rows here -->
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
```

### Private Action Seeding Pattern

```typescript
// src/convex/private/seed.ts — action calls internal mutation
import { internal } from '../_generated/api';
import { v } from 'convex/values';
import { privateAction } from './helpers';

export const seedCatalogChunk = privateAction({
  args: {
    items: v.array(v.object({
      type: v.string(),
      number: v.number(),
      imagePath: v.optional(v.string()),
    }))
  },
  handler: async (ctx, args) => {
    // Actions must call runMutation to write to DB
    await ctx.runMutation(internal.private.seedMutations.insertCatalogChunk, {
      items: args.items
    });
    return { inserted: args.items.length };
  }
});
```

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| Svelte 4 stores (`writable`, `readable`) | Svelte 5 Runes (`$state`, `$derived`, `$effect`) | Codebase is fully Runes-mode; do not use stores |
| `svelte-persisted-store` | `runed` `PersistedState` | svelte-persisted-store unsettled for Svelte 5 |
| `on:click` directive | `onclick={handler}` attribute | Svelte 5 event handler syntax |
| Tailwind v3 config-based colors | Tailwind v4 CSS variable-based config | This project uses Tailwind v4 — no `tailwind.config.js` needed |

---

## Open Questions

1. **Number extraction for `series` type items**
   - What we know: Series items like `NBA60139.jpg` have large 5-digit numbers. The imagePath dirs are `031_-1` and `032_-2` suggesting sub-series groupings.
   - What's unclear: Should the number be extracted as `60139` (full) or `139` (last 3 digits)? The sidebar groups in ranges of 100 — if numbers are 5-digit, the range labels would be "60100–60199".
   - Recommendation: Extract the full number as-is (`60139`). Range labels derived from `Math.floor(number / 100) * 100` will correctly bucket items regardless of magnitude.

2. **Catalog page routing — guest access**
   - What we know: The current `/app` route wraps children in `ClerkWrapper` + `ConvexWrapper`. `ClerkWrapper` shows the sign-in modal if unauthenticated.
   - What's unclear: The UI-SPEC says catalog browsing has no auth requirement in Phase 1. Does `/app/catalog` need to bypass the ClerkWrapper sign-in gate?
   - Recommendation: The catalog page should NOT be behind a sign-in wall for Phase 1. Either move catalog to a non-`/app` route (e.g., `/catalog`) or modify the `/app/+layout.svelte` to only gate sign-in for list-specific routes. Given CATL-04 shows completion badges as auth-conditional, `/app/catalog` with conditional auth display is the cleaner choice — but the layout must NOT redirect unauthenticated users.

3. **Seeding trigger mechanism**
   - What we know: Seed data lives in `catalog.json` at the project root; the seeding must call a `privateAction`.
   - What's unclear: Is seed triggered manually (e.g., a script or one-off admin route) or automatically on deploy?
   - Recommendation: Create a `/app/catalog/seed` SvelteKit server route (admin-only by env var check) for Phase 1. Phase 5 admin will replace this with proper admin tooling.

---

## Environment Availability

Step 2.6: External dependency audit.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Bun | Package manager | Confirmed (CLAUDE.md) | — | — |
| Convex CLI | `bun run convex:gen` | Confirmed (package.json script) | 1.33.0 | — |
| Node.js | npx for shadcn-svelte init | Confirmed (WSL2 environment) | — | — |
| `runed` npm package | LazyImage intersection observer | Not installed | 0.37.1 (latest) | `bun add runed` |
| shadcn-svelte | Accordion, Badge, Card | Not installed | 1.2.7 (latest) | `npx shadcn-svelte@latest init` |
| `lucide-svelte` | ImageOff icon, chevron icons | Not installed (added by shadcn init) | 1.0.1 | Installed by shadcn-svelte init |
| `bits-ui` | shadcn-svelte component primitives | Not installed (added by shadcn init) | 2.16.5 | Installed by shadcn-svelte init |

**Missing dependencies with no fallback:** None — all have install paths.

**Missing dependencies with fallback:** N/A — all are installable before implementation begins.

**Wave 0 prerequisite (blocking):** `components.json` must exist before any `$lib/components/ui/...` import is written. This means shadcn-svelte init must be the first task in the plan.

---

## Project Constraints (from CLAUDE.md)

All directives extracted from `/home/btam/other-code/diddl-manager/website-svelte/CLAUDE.md`:

| Directive | Impact on Phase 1 |
|-----------|------------------|
| Use `bun` for package manager | All installs: `bun add runed`; NOT `npm install` |
| Use `bun add` for new packages | Do not manually edit `package.json` |
| Modern Svelte 5 runes patterns | `$state`, `$derived`, `$props` — no Svelte 4 stores |
| Avoid `as any` | Type all Convex query results via inferred types from generated API |
| `authed` setup for client-facing Convex functions | `authedQuery` / `authedMutation` from `src/convex/authed/` — EXCEPT catalog queries need plain `query()` for guest access |
| `private` setup for backend Convex functions | `privateAction` / `privateMutation` for seed functions |
| Effect v4 for all backend code | Seed trigger in SvelteKit server route must use `Effect.gen()` via `ConvexPrivateService` |
| Use Convex service for calling Convex from backend | Do not call Convex HTTP API directly — use `ConvexPrivateService` |
| Tailwind CSS for styling | No inline styles, no CSS modules |
| Every Svelte component has `lang="ts"` | All `.svelte` files in `src/lib/components/catalog/` |
| Run `bun run convex:gen` after Convex changes | Required after schema.ts change and after each new authed/private function |
| Run `bun run lint`, `bun run format`, `bun run check` | After each task completion |

---

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/convex/schema.ts`, `src/convex/authed/helpers.ts`, `src/convex/private/helpers.ts` — confirmed patterns
- Existing codebase: `src/lib/stores/clerk.svelte.ts`, `src/lib/wrappers/ConvexWrapper.svelte` — Clerk/Convex integration patterns
- `./catalog.json` — data shape, item count, type distribution confirmed by direct inspection
- `.planning/research/SUMMARY.md` — HIGH confidence findings from prior project research
- `.planning/phases/01-schema-catalog/01-UI-SPEC.md` — component inventory, layout spec, interaction states
- `package.json` — confirmed installed versions, confirmed runed/shadcn NOT yet installed
- [Convex schema docs](https://docs.convex.dev/database/schemas) — compound index syntax verified in research/SUMMARY.md
- [Convex file storage: serve files](https://docs.convex.dev/file-storage/serve-files) — `ctx.storage.getUrl()` pattern

### Secondary (MEDIUM confidence)
- [shadcn-svelte official docs](https://www.shadcn-svelte.com/) — init command, stone theme, component add syntax
- [convex-svelte GitHub](https://github.com/get-convex/convex-svelte) — `useQuery` skip pattern
- [runed docs](https://runed.dev/docs/utilities/use-intersection-observer) — `useIntersectionObserver` API

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed from package.json + npm registry
- Schema patterns: HIGH — sourced from existing codebase + Convex official docs (via SUMMARY.md)
- Catalog data shape: HIGH — derived from direct inspection of catalog.json (3,913 items)
- Architecture: HIGH — follows established codebase patterns directly
- shadcn-svelte: MEDIUM — user decision confirmed; init flow standard but `components.json` not yet present

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (stable stack; convex-svelte and runed are slow-moving)
