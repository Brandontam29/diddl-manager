# Phase 2: Guest List Mode - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can create and manage collection lists with full item-level detail — all stored in localStorage without needing an account. This phase builds the complete list management UI and the abstract ListStore seam that Phase 3 will swap to Convex-backed storage on sign-in. Guests are limited to 1 list.

</domain>

<decisions>
## Implementation Decisions

### List Management UX

- **D-01:** List creation uses a dialog/modal with name + color picker fields
- **D-02:** Colors are a preset palette of 6-8 curated colors (Todoist/Google Keep style)
- **D-03:** Lists live on a dedicated `/app/lists` page (not in the catalog sidebar)
- **D-04:** List deletion uses a confirmation dialog ("Are you sure? This will delete X items")
- **D-05:** Guests are limited to 1 list. This is a hard constraint — incentivizes sign-up

### Adding Items to Lists

- **D-06:** Catalog view uses select mode + bulk add — enter selection mode, check multiple items, then "Add selected to list"
- **D-07:** List picker (when user has multiple lists — authed only since guests have 1): Claude's discretion on dropdown vs popover
- **D-08:** List detail page has a "show unowned" toggle button — when enabled, shows catalog items NOT in the list alongside owned items
- **D-09:** List detail page has its own sidebar with the category tree (same pattern as catalog page). The sidebar filters both owned items and unowned items when "show unowned" is active
- **D-10:** No visual indicator on catalog cards showing whether item is in a list — keep catalog view clean

### Item Detail Editing (List Detail Page)

- **D-11:** List items display as a grid of cards — each card shows image + name, with a quantity stepper (- / count / +) on the bottom-left corner
- **D-12:** Multi-select by clicking top-left corner of cards (checkbox/selection indicator)
- **D-13:** Action taskbar appears at top when 1+ cards selected. Actions: Duplicate, Mark Complete, Mark Incomplete, Set Condition (dropdown), Remove
- **D-14:** Condition is set via the taskbar when items are selected (not per-card inline)
- **D-15:** Condition labels match schema values: Mint, Near Mint, Good, Poor, Damaged
- **D-16:** Completion filter lives in the toolbar/taskbar area (not a separate toggle) — filter to show only missing/incomplete items
- **D-17:** Completion percentage displays on both the lists overview page AND at the top of the list detail page
- **D-18:** Sidebar in list detail page has a toggle to show owned/total counts per type (e.g., "A4 Sheets (12/150)")

### localStorage Store Design

- **D-19:** Build the abstract ListStore interface now — GuestListStore (localStorage) and future ConvexListStore both implement it. Components code against the interface.
- **D-20:** Simplified localStorage data shape — NOT an exact mirror of Convex schema. Use natural keys (type+number) to reference catalog items instead of Convex IDs. Phase 3 migration mapper transforms to Convex shape.
- **D-21:** Svelte 5 runes ($state/$derived) for the store API. Reactive properties that components subscribe to. Consistent with modern Svelte 5 patterns and enables fine-grained reactivity for frequently-changing list data.
- **D-22:** Auto-save on every change — every add/edit/remove immediately writes to localStorage. No save button. Matches how Convex mutations will work (instant).
- **D-23:** Error toast when localStorage is full or unavailable (private browsing). Suggest signing up for reliable persistence.
- **D-24:** Svelte reactivity handles cross-component updates — no custom event bus. Mutations to $state trigger reactive updates automatically.

### Claude's Discretion

- List picker UI for authed users with multiple lists (D-07)
- Exact preset color palette choices
- Taskbar visual design and positioning
- "Show unowned" visual treatment for unowned items (grayed out, outlined, etc.)

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema & Data Model

- `src/convex/schema.ts` — Defines `lists` and `listItems` tables with all fields, indexes, and condition enum values
- `models/list-models.ts` — Original Zod schemas for list/listItem (reference only — Convex schema is source of truth for field names)

### Existing UI Patterns

- `src/lib/components/catalog/CatalogGrid.svelte` — Grid layout pattern to follow for list item grid
- `src/lib/components/catalog/CatalogItemCard.svelte` — Card component pattern for catalog items
- `src/lib/components/catalog/CatalogSidebar.svelte` — Sidebar with category tree to replicate in list detail page
- `src/lib/components/catalog/CompletionBadge.svelte` — Completion percentage display component
- `src/lib/components/catalog/LazyImage.svelte` — Image lazy loading pattern

### Store Patterns

- `src/lib/stores/clerk.svelte.ts` — Existing Svelte 5 runes store pattern (context-based with getters/setters)

### UI Framework

- `src/lib/components/ui/` — shadcn-svelte components (badge, card, accordion already installed)

### State & Architecture

- `.planning/STATE.md` — Notes on ListStore abstract seam decision and migration idempotency key
- `.planning/research/SUMMARY.md` — Research summary noting ListStore interface must be defined before list UI

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `CatalogGrid.svelte` — Responsive grid layout; pattern can be replicated for list item grid
- `CatalogItemCard.svelte` — Card component with image display; list item cards follow similar structure
- `CatalogSidebar.svelte` — Category tree sidebar; reuse in list detail page for filtering
- `CompletionBadge.svelte` — Already built for completion percentage display
- `LazyImage.svelte` — Image lazy loading via IntersectionObserver
- shadcn-svelte `Badge`, `Card`, `Accordion` components installed

### Established Patterns

- Svelte 5 runes for state management ($state, $derived, $props)
- Convex `useQuery()` for reactive data fetching (will inform ConvexListStore interface)
- URL search params for filtering (type, from, to in catalog page)
- ClerkStore: context-based store with getter/setter functions

### Integration Points

- `/app/lists` — New route for list overview page
- `/app/lists/[id]` — New route for list detail page
- `src/routes/app/+layout.svelte` — May need nav updates to include lists link
- Catalog page — Needs select mode + "Add to list" bulk action
- Sidebar — List detail page reuses catalog sidebar pattern with additional toggles

</code_context>

<specifics>
## Specific Ideas

- List detail grid cards: image + name only, quantity stepper (- / count / +) on bottom-left corner
- Multi-select via top-left card checkbox, action taskbar at top
- Taskbar actions: Duplicate, Complete, Incomplete, Set Condition, Remove
- "Show unowned" button reveals catalog items not in list, filtered by same sidebar category tree
- Sidebar toggle for owned/total counts (e.g., "A4 Sheets (12/150)")
- Guest limited to 1 list — clean constraint, sign-up incentive

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 02-guest-list-mode_
_Context gathered: 2026-04-03_
