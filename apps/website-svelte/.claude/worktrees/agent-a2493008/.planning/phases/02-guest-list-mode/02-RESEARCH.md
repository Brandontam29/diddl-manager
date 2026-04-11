# Phase 2: Guest List Mode - Research

**Researched:** 2026-04-03
**Domain:** Svelte 5 localStorage state management, shadcn-svelte UI components, abstract store pattern
**Confidence:** HIGH

## Summary

This phase builds the complete list management experience -- creating lists, adding catalog items, editing item details (condition, quantity, complete flag), and viewing completion progress. All data is persisted in localStorage for guest users. The critical architectural decision is the abstract ListStore interface (D-19) that both GuestListStore (localStorage) and the future ConvexListStore will implement. This ensures components code against the interface, not the storage backend.

The project already has established patterns: Svelte 5 runes for state ($state, $derived), shadcn-svelte for UI primitives (card, badge, accordion installed), and a catalog page with sidebar + grid layout that the list detail page will mirror. The localStorage store uses a simplified data shape with natural keys (type+number) rather than Convex IDs (D-20), and Phase 3's migration mapper will transform to the Convex shape.

**Primary recommendation:** Build the ListStore interface first as a standalone module, then GuestListStore implementing it with $state runes and localStorage auto-save. Wire up the UI last, coding exclusively against the interface. Install shadcn-svelte dialog, alert-dialog, button, checkbox, dropdown-menu, separator, toggle, and sonner components upfront.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- D-01: List creation uses a dialog/modal with name + color picker fields
- D-02: Colors are a preset palette of 6-8 curated colors (Todoist/Google Keep style)
- D-03: Lists live on a dedicated `/app/lists` page (not in the catalog sidebar)
- D-04: List deletion uses a confirmation dialog ("Are you sure? This will delete X items")
- D-05: Guests are limited to 1 list. This is a hard constraint -- incentivizes sign-up
- D-06: Catalog view uses select mode + bulk add -- enter selection mode, check multiple items, then "Add selected to list"
- D-07: List picker (when user has multiple lists -- authed only since guests have 1): Claude's discretion on dropdown vs popover
- D-08: List detail page has a "show unowned" toggle button -- when enabled, shows catalog items NOT in the list alongside owned items
- D-09: List detail page has its own sidebar with the category tree (same pattern as catalog page). The sidebar filters both owned items and unowned items when "show unowned" is active
- D-10: No visual indicator on catalog cards showing whether item is in a list -- keep catalog view clean
- D-11: List items display as a grid of cards -- each card shows image + name, with a quantity stepper (- / count / +) on the bottom-left corner
- D-12: Multi-select by clicking top-left corner of cards (checkbox/selection indicator)
- D-13: Action taskbar appears at top when 1+ cards selected. Actions: Duplicate, Mark Complete, Mark Incomplete, Set Condition (dropdown), Remove
- D-14: Condition is set via the taskbar when items are selected (not per-card inline)
- D-15: Condition labels match schema values: Mint, Near Mint, Good, Poor, Damaged
- D-16: Completion filter lives in the toolbar/taskbar area (not a separate toggle) -- filter to show only missing/incomplete items
- D-17: Completion percentage displays on both the lists overview page AND at the top of the list detail page
- D-18: Sidebar in list detail page has a toggle to show owned/total counts per type (e.g., "A4 Sheets (12/150)")
- D-19: Build the abstract ListStore interface now -- GuestListStore (localStorage) and future ConvexListStore both implement it. Components code against the interface.
- D-20: Simplified localStorage data shape -- NOT an exact mirror of Convex schema. Use natural keys (type+number) to reference catalog items instead of Convex IDs. Phase 3 migration mapper transforms to Convex shape.
- D-21: Svelte 5 runes ($state/$derived) for the store API. Reactive properties that components subscribe to.
- D-22: Auto-save on every change -- every add/edit/remove immediately writes to localStorage. No save button.
- D-23: Error toast when localStorage is full or unavailable (private browsing). Suggest signing up for reliable persistence.
- D-24: Svelte reactivity handles cross-component updates -- no custom event bus.

### Claude's Discretion

- List picker UI for authed users with multiple lists (D-07)
- Exact preset color palette choices
- Taskbar visual design and positioning
- "Show unowned" visual treatment for unowned items (grayed out, outlined, etc.)

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                                                       | Research Support                                                    |
| ------- | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| LIST-01 | User can create a new list with a name and color indicator        | ListStore.createList(), Dialog component, color palette pattern     |
| LIST-02 | User can rename a list and change its color                       | ListStore.updateList(), inline edit or dialog reuse                 |
| LIST-03 | User can delete a list with confirmation                          | ListStore.deleteList(), AlertDialog component                       |
| LIST-04 | User can add a catalog item to a list from the catalog view       | Select mode on CatalogGrid, ListStore.addItems(), bulk add pattern  |
| LIST-05 | User can remove an item from a list                               | ListStore.removeItems(), taskbar Remove action                      |
| LIST-06 | User can modify the quantity/count of a list item                 | ListStore.updateItem(), quantity stepper UI pattern                 |
| LIST-07 | User can tag the condition of a list item                         | ListStore.updateItem(), taskbar condition dropdown                  |
| LIST-08 | User can mark a list item as complete or incomplete               | ListStore.updateItem(), taskbar Mark Complete/Incomplete            |
| LIST-09 | User can duplicate a list item to tag it with different condition | ListStore.duplicateItem(), generates new entry with same catalogRef |
| LIST-10 | User can add catalog items from within the list detail page       | "Show unowned" toggle, sidebar filtering, add-from-grid pattern     |
| LIST-11 | User can view completion percentage per list                      | $derived completion calc, CompletionBadge reuse                     |
| LIST-12 | User can filter to show only missing (incomplete) items in list   | Toolbar filter toggle, $derived filtering                           |

</phase_requirements>

## Standard Stack

### Core (already installed)

| Library        | Version | Purpose                 | Why Standard                                       |
| -------------- | ------- | ----------------------- | -------------------------------------------------- |
| svelte         | ^5.51.0 | UI framework with runes | Project standard, $state/$derived for reactivity   |
| bits-ui        | ^2.16.3 | Headless UI primitives  | Powers shadcn-svelte components                    |
| shadcn-svelte  | ^1.2.7  | UI component library    | Project standard, already has card/badge/accordion |
| runed          | ^0.37.1 | Svelte 5 utility runes  | Already installed, useful for derived utilities    |
| @lucide/svelte | ^1.7.0  | Icons                   | Already installed for UI icons                     |

### To Install

| Library                      | Purpose                                              | Install Command                                |
| ---------------------------- | ---------------------------------------------------- | ---------------------------------------------- |
| shadcn-svelte: dialog        | List create/edit modal (D-01)                        | `bun x shadcn-svelte@latest add dialog`        |
| shadcn-svelte: alert-dialog  | Delete confirmation (D-04)                           | `bun x shadcn-svelte@latest add alert-dialog`  |
| shadcn-svelte: button        | Action buttons, steppers                             | `bun x shadcn-svelte@latest add button`        |
| shadcn-svelte: checkbox      | Multi-select cards (D-12)                            | `bun x shadcn-svelte@latest add checkbox`      |
| shadcn-svelte: dropdown-menu | Condition picker in taskbar (D-14)                   | `bun x shadcn-svelte@latest add dropdown-menu` |
| shadcn-svelte: separator     | Visual separators in toolbar                         | `bun x shadcn-svelte@latest add separator`     |
| shadcn-svelte: toggle        | Show unowned toggle (D-08), completion filter (D-16) | `bun x shadcn-svelte@latest add toggle`        |
| shadcn-svelte: sonner        | Error toasts for localStorage failures (D-23)        | `bun x shadcn-svelte@latest add sonner`        |
| svelte-sonner                | Toast engine (dependency of shadcn sonner)           | Auto-installed with sonner component           |

### Alternatives Considered

| Instead of              | Could Use                          | Tradeoff                                                                                                                       |
| ----------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| svelte-persisted-state  | Hand-rolled $effect + localStorage | Library adds cross-tab sync but is an extra dependency; hand-rolled is simpler and matches D-19 abstract interface requirement |
| Popover for list picker | DropdownMenu                       | DropdownMenu is simpler for single-select; Popover better for search -- use DropdownMenu for D-07                              |

**Installation (batch all shadcn components):**

```bash
bun x shadcn-svelte@latest add dialog alert-dialog button checkbox dropdown-menu separator toggle sonner
```

## Architecture Patterns

### Recommended Project Structure

```
src/lib/
  stores/
    list-store.svelte.ts        # ListStore interface + types
    guest-list-store.svelte.ts  # GuestListStore: localStorage impl
    list-context.svelte.ts      # Svelte context provider (getListStore/setListStore)
  components/
    lists/
      ListOverviewPage.svelte   # /app/lists content (list cards + create button)
      ListCard.svelte           # Overview card with name, color, completion %
      CreateListDialog.svelte   # Dialog with name + color palette
      EditListDialog.svelte     # Dialog reuse for rename/recolor
      DeleteListDialog.svelte   # AlertDialog confirmation
      ListDetailPage.svelte     # /app/lists/[id] content
      ListItemCard.svelte       # Card with image, name, quantity stepper, checkbox
      ListToolbar.svelte        # Action taskbar (appears when items selected)
      ListSidebar.svelte        # Category tree sidebar for list detail page
      ColorPalette.svelte       # Preset color picker (6-8 swatches)
      QuantityStepper.svelte    # - / count / + control
  types/
    list.ts                     # Shared TypeScript types for list data shapes
src/routes/
  app/
    lists/
      +page.svelte              # Lists overview page
      [id]/
        +page.svelte            # List detail page
    catalog/
      +page.svelte              # Updated: add select mode + bulk add
```

### Pattern 1: Abstract ListStore Interface

**What:** TypeScript interface that both GuestListStore and ConvexListStore implement. Components import and use only this interface via Svelte context.

**When to use:** Always -- this is the foundational architectural decision (D-19).

**Example:**

```typescript
// src/lib/types/list.ts

// Condition enum matching Convex schema values
export type ItemCondition = "mint" | "near_mint" | "good" | "poor" | "damaged";

// Natural key for catalog reference (D-20: no Convex IDs in localStorage)
export interface CatalogRef {
  type: string; // e.g., "A4"
  number: number; // e.g., 42
}

// localStorage list shape (simplified per D-20)
export interface GuestList {
  id: string; // UUID generated client-side
  name: string;
  color: string;
  createdAt: number; // epoch ms
}

export interface GuestListItem {
  id: string; // UUID generated client-side
  listId: string;
  catalogRef: CatalogRef;
  condition: ItemCondition;
  quantity: number;
  complete: boolean;
  tags: string[];
}
```

```typescript
// src/lib/stores/list-store.svelte.ts

import type { GuestList, GuestListItem, CatalogRef, ItemCondition } from "$lib/types/list";

export interface ListStore {
  // Reactive state (components subscribe to these)
  readonly lists: GuestList[];
  readonly activeListId: string | null;
  readonly activeListItems: GuestListItem[];

  // List CRUD
  createList(name: string, color: string): GuestList;
  updateList(id: string, updates: Partial<Pick<GuestList, "name" | "color">>): void;
  deleteList(id: string): void;
  setActiveList(id: string | null): void;

  // Item CRUD
  addItems(listId: string, refs: CatalogRef[]): void;
  removeItems(itemIds: string[]): void;
  updateItem(
    itemId: string,
    updates: Partial<Pick<GuestListItem, "condition" | "quantity" | "complete">>,
  ): void;
  duplicateItem(itemId: string): GuestListItem;

  // Derived / computed
  completionPercent(listId: string): number;
  itemsByType(listId: string, type: string): GuestListItem[];
}
```

### Pattern 2: GuestListStore with $state and localStorage Auto-Save

**What:** Implements ListStore using Svelte 5 $state for reactivity and $effect for localStorage persistence (D-21, D-22).

**When to use:** Guest mode (no auth).

**Example:**

```typescript
// src/lib/stores/guest-list-store.svelte.ts (simplified)

import { toast } from "svelte-sonner";
import type { GuestList, GuestListItem, CatalogRef, ListStore } from "$lib/types/list";

const STORAGE_KEY = "diddl-lists";

function loadFromStorage(): { lists: GuestList[]; items: GuestListItem[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { lists: [], items: [] };
  } catch {
    return { lists: [], items: [] };
  }
}

function saveToStorage(data: { lists: GuestList[]; items: GuestListItem[] }): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    toast.error("Storage full. Sign up to save your collection reliably.");
  }
}

export class GuestListStore implements ListStore {
  #lists = $state<GuestList[]>([]);
  #items = $state<GuestListItem[]>([]);
  #activeListId = $state<string | null>(null);
  #initialized = false;

  constructor() {
    // Load once from localStorage
    const stored = loadFromStorage();
    this.#lists = stored.lists;
    this.#items = stored.items;
    this.#initialized = true;

    // Auto-save on every change (D-22)
    $effect(() => {
      if (!this.#initialized) return;
      saveToStorage({ lists: this.#lists, items: this.#items });
    });
  }

  get lists() {
    return this.#lists;
  }
  get activeListId() {
    return this.#activeListId;
  }
  get activeListItems() {
    return this.#items.filter((i) => i.listId === this.#activeListId);
  }

  // ... CRUD methods mutate #lists / #items which triggers $effect auto-save
}
```

### Pattern 3: Context-Based Store Provider

**What:** Follow the established ClerkStore pattern -- create context with getter/setter so components access the store via `getListStore()`.

**When to use:** Always -- matches existing project conventions (see `clerk.svelte.ts`).

**Example:**

```typescript
// src/lib/stores/list-context.svelte.ts

import { createContext } from "svelte";
import type { ListStore } from "./list-store.svelte";

const [internalGetListStore, setInternalListStore] = createContext<ListStore>();

export function getListStore(): ListStore {
  const store = internalGetListStore();
  if (!store) throw new Error("ListStore context not found");
  return store;
}

export function setListStore(store: ListStore): void {
  setInternalListStore(store);
}
```

### Pattern 4: Select Mode for Catalog Bulk Add

**What:** Toggle selection mode on catalog grid. Cards show checkboxes when active. Floating toolbar with "Add to list" action.

**When to use:** Catalog page for LIST-04.

**Key details:**

- Selection state lives in the catalog page component as `$state<Set<string>>` (set of `type:number` keys)
- Selection mode toggled by a button in the catalog page header
- When selection mode active, each CatalogItemCard renders a Checkbox in top-left
- "Add selected to list" triggers `listStore.addItems()` with all selected CatalogRefs
- For guests (1 list): adds directly to the single list. For authed (multiple): show DropdownMenu picker.

### Anti-Patterns to Avoid

- **Coupling to Convex IDs in localStorage:** Guest store must use natural keys (type+number) per D-20. Never store `Id<'catalogItems'>` or `Id<'lists'>` in localStorage -- they won't exist until Phase 3 migration.
- **Custom event bus for cross-component updates:** Per D-24, Svelte reactivity ($state mutations) handles this. Do not create a custom EventEmitter or pub/sub.
- **Writable stores (Svelte 4 pattern):** Use $state runes, not `writable()` from `svelte/store`. The project is Svelte 5 only.
- **Giant monolithic component:** The list detail page has many concerns (sidebar, grid, toolbar, selection). Split into focused components.
- **Storing derived data in localStorage:** Do not persist completion percentages or filtered views. Compute these reactively with $derived.

## Don't Hand-Roll

| Problem             | Don't Build                    | Use Instead                             | Why                                                                       |
| ------------------- | ------------------------------ | --------------------------------------- | ------------------------------------------------------------------------- |
| Modal dialogs       | Custom overlay + focus trap    | shadcn-svelte Dialog / AlertDialog      | Accessibility (focus trap, escape key, aria attributes), portal rendering |
| Toast notifications | Custom notification system     | svelte-sonner via shadcn Sonner         | Animation, stacking, auto-dismiss, accessible announcements               |
| UUID generation     | Math.random string             | `crypto.randomUUID()`                   | Collision-safe, native browser API, available in all modern browsers      |
| Dropdown menus      | Custom popover + click-outside | shadcn-svelte DropdownMenu              | Keyboard nav, submenu support, accessible                                 |
| Checkbox state      | Custom div with click handler  | shadcn-svelte Checkbox                  | Accessible, consistent styling, indeterminate state support               |
| Color picker        | Full color wheel               | Preset palette of color swatches (D-02) | Simpler, consistent, matches Todoist/Google Keep pattern                  |

**Key insight:** shadcn-svelte provides every UI primitive needed for this phase. The only custom components are domain-specific (QuantityStepper, ColorPalette, ListItemCard, ListToolbar).

## Common Pitfalls

### Pitfall 1: $effect Loop with localStorage

**What goes wrong:** Writing to localStorage inside $effect that reads $state causes an infinite loop if the storage read triggers a state update.
**Why it happens:** $effect tracks all reactive reads. If you read from localStorage inside $effect and update $state, the $state change re-triggers the $effect.
**How to avoid:** Load from localStorage only once in the constructor (not inside $effect). Use $effect only for writing. Use an `#initialized` flag to gate the first write.
**Warning signs:** Browser freezing, "Maximum call stack exceeded", rapid localStorage writes.

### Pitfall 2: localStorage Quota Exceeded in Private Browsing

**What goes wrong:** Safari private browsing and some mobile browsers have very limited localStorage (~0-5MB). Writing fails silently or throws.
**Why it happens:** Privacy modes restrict persistent storage.
**How to avoid:** Wrap every `localStorage.setItem()` in try/catch. Show a toast (D-23) suggesting sign-up. Never assume writes succeed.
**Warning signs:** `QuotaExceededError` exceptions, silent data loss.

### Pitfall 3: Stale Store Reference After Navigation

**What goes wrong:** Component navigates away and back, but gets a new store instance instead of the existing one.
**Why it happens:** If store is instantiated per-component instead of per-context, navigation creates a new instance that re-reads stale localStorage.
**How to avoid:** Instantiate GuestListStore once in the layout (like ClerkStore) via context. Use `getListStore()` in child components.
**Warning signs:** Edits disappear on navigation, flickering data.

### Pitfall 4: Natural Key Collisions on Duplicate Items

**What goes wrong:** Two list items reference the same catalog item (after "duplicate" action for different conditions). If you use `type:number` as the unique key, they collide.
**Why it happens:** LIST-09 requires duplicate items with different conditions for the same catalog item.
**How to avoid:** Each list item gets its own UUID (`id` field). The `catalogRef` (type+number) is a reference, not the primary key. Multiple items can share the same catalogRef.
**Warning signs:** Duplicate action overwrites existing item instead of creating a new entry.

### Pitfall 5: Guest Limit Enforcement (1 List)

**What goes wrong:** Guest creates more than 1 list because the enforcement is only in the UI button state.
**Why it happens:** Only disabling the "Create List" button is insufficient if there are code paths that bypass it.
**How to avoid:** Enforce the 1-list guest limit in `GuestListStore.createList()` itself -- throw or return early if `this.#lists.length >= 1`. UI also disables the button as a UX signal.
**Warning signs:** Guest ends up with multiple lists in localStorage.

### Pitfall 6: Serialization of $state Proxy Objects

**What goes wrong:** `JSON.stringify()` on $state proxy objects may behave unexpectedly or include internal Svelte metadata.
**Why it happens:** Svelte 5 $state uses JavaScript proxies. Direct serialization of the proxy may not produce clean JSON.
**How to avoid:** Use `$state.snapshot()`before serializing to localStorage. This strips the proxy wrapper and returns a plain object.
**Warning signs:** Extra properties in stored JSON,`TypeError` during serialization.

## Code Examples

### Color Palette Component

```svelte
<!-- src/lib/components/lists/ColorPalette.svelte -->
<script lang="ts">
	// Preset palette (D-02: Todoist/Google Keep style, 6-8 colors)
	const COLORS = [
		{ name: 'Berry', value: '#e11d48' },
		{ name: 'Sunset', value: '#ea580c' },
		{ name: 'Honey', value: '#ca8a04' },
		{ name: 'Forest', value: '#16a34a' },
		{ name: 'Ocean', value: '#2563eb' },
		{ name: 'Violet', value: '#9333ea' },
		{ name: 'Slate', value: '#64748b' },
		{ name: 'Stone', value: '#78716c' }
	];

	let { selected, onSelect }: { selected: string; onSelect: (color: string) => void } = $props();
</script>

<div class="flex gap-2">
	{#each COLORS as color}
		<button
			type="button"
			class="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
			class:border-stone-900={selected === color.value}
			class:border-transparent={selected !== color.value}
			style="background-color: {color.value}"
			title={color.name}
			onclick={() => onSelect(color.value)}
		></button>
	{/each}
</div>
```

### Quantity Stepper Component

```svelte
<!-- src/lib/components/lists/QuantityStepper.svelte -->
<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Minus, Plus } from '@lucide/svelte';

	let { quantity, onUpdate }: { quantity: number; onUpdate: (q: number) => void } = $props();
</script>

<div class="flex items-center gap-1">
	<Button
		variant="ghost"
		size="icon"
		class="h-6 w-6"
		disabled={quantity <= 1}
		onclick={() => onUpdate(quantity - 1)}
	>
		<Minus class="h-3 w-3" />
	</Button>
	<span class="min-w-[1.5rem] text-center text-xs font-medium">{quantity}</span>
	<Button variant="ghost" size="icon" class="h-6 w-6" onclick={() => onUpdate(quantity + 1)}>
		<Plus class="h-3 w-3" />
	</Button>
</div>
```

### $state.snapshot for localStorage Serialization

```typescript
// When saving to localStorage, always snapshot first
function saveToStorage(data: { lists: GuestList[]; items: GuestListItem[] }): void {
  try {
    const plain = $state.snapshot(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plain));
  } catch (e) {
    toast.error("Storage full. Sign up to save your collection reliably.");
  }
}
```

### Completion Percentage (Derived)

```typescript
// Inside GuestListStore
completionPercent(listId: string): number {
  const items = this.#items.filter(i => i.listId === listId);
  if (items.length === 0) return 0;
  const complete = items.filter(i => i.complete).length;
  return Math.round((complete / items.length) * 100);
}
```

## State of the Art

| Old Approach                  | Current Approach                   | When Changed    | Impact                                       |
| ----------------------------- | ---------------------------------- | --------------- | -------------------------------------------- |
| Svelte stores (`writable()`)  | Svelte 5 runes ($state, $derived)  | Svelte 5 (2024) | Runes are the standard; stores are legacy    |
| svelte-persisted-store        | Hand-rolled $effect + localStorage | Svelte 5 (2024) | Old library doesn't support runes well       |
| Component events (`dispatch`) | Callback props (`onX` functions)   | Svelte 5 (2024) | Event forwarding removed; use callback props |
| `<slot>`                      | `{@render children()}`             | Svelte 5 (2024) | Snippets replace slots                       |
| `export let` for props        | `let { ... } = $props()`           | Svelte 5 (2024) | Destructured $props is the new pattern       |

## Open Questions

1. **Cross-tab sync for localStorage**
   - What we know: If user has two tabs open, localStorage changes in one tab won't reactively update the other. The `storage` event exists but requires manual wiring.
   - What's unclear: Whether this is worth handling in Phase 2 or can wait.
   - Recommendation: Defer cross-tab sync. It adds complexity with no user request. Phase 3 (Convex) provides real-time sync anyway.

2. **"Show unowned" performance with ~10,000 catalog items**
   - What we know: When "show unowned" is toggled on the list detail page, we need all catalog items for the selected type/range minus those already in the list. Catalog items come from Convex queries (already paginated by type in groups of 100).
   - What's unclear: Whether the existing `listByRange` query is sufficient or if a specialized query is needed.
   - Recommendation: Reuse the existing `listByRange` Convex query for the selected sidebar range. Client-side filter out items already in the list using a Set of `type:number` keys. With max 100 items per range, this is trivial.

3. **Sidebar category tree data source for list detail page**
   - What we know: The catalog sidebar fetches diddlTypes from Convex. The list detail sidebar needs the same data plus owned/total counts.
   - What's unclear: Whether the existing diddlTypes query suffices or needs augmentation.
   - Recommendation: Reuse the existing `diddlTypes.list` and `catalog.countByType` queries. Compute "owned count per type" client-side from the list items in the store. No new Convex queries needed.

## Sources

### Primary (HIGH confidence)

- Project codebase: `src/convex/schema.ts` -- Convex schema with lists/listItems tables, condition enum
- Project codebase: `src/lib/stores/clerk.svelte.ts` -- Established Svelte 5 runes store + context pattern
- Project codebase: `src/lib/components/catalog/` -- Existing card, grid, sidebar patterns
- Project codebase: `src/routes/app/catalog/+page.svelte` -- URL-driven query pattern

### Secondary (MEDIUM confidence)

- [shadcn-svelte Dialog](https://www.shadcn-svelte.com/docs/components/dialog) -- Dialog component docs
- [shadcn-svelte Alert Dialog](https://www.shadcn-svelte.com/docs/components/alert-dialog) -- Confirmation dialog
- [shadcn-svelte Sonner](https://www.shadcn-svelte.com/docs/components/sonner) -- Toast component
- [shadcn-svelte Components](https://shadcn-svelte.com/docs/components) -- Full component list
- [Svelte 5 Persistent State](https://dev.to/developerbishwas/svelte-5-persistent-state-strictly-runes-supported-3lgm) -- $state + localStorage pattern
- [svelte-persisted-state](https://github.com/oMaN-Rod/svelte-persisted-state) -- Reference implementation for persistence patterns
- [Svelte Stores Docs](https://svelte.dev/docs/svelte/stores) -- Official docs on stores vs runes

### Tertiary (LOW confidence)

- None

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH -- all libraries already in the project or well-documented shadcn-svelte components
- Architecture: HIGH -- abstract store pattern is a locked decision (D-19), implementation follows established ClerkStore pattern
- Pitfalls: HIGH -- localStorage gotchas are well-documented; $state proxy serialization is a known Svelte 5 concern

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (stable domain, no fast-moving dependencies)
