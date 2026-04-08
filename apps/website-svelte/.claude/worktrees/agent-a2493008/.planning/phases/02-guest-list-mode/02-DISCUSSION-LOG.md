# Phase 2: Guest List Mode - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-03
**Phase:** 02-guest-list-mode
**Areas discussed:** List management UX, Adding items to lists, Item detail editing, localStorage store design

---

## List Management UX

| Option                 | Description                                                            | Selected |
| ---------------------- | ---------------------------------------------------------------------- | -------- |
| Dialog/modal           | Click 'New List' button, modal pops up with name + color picker fields | ✓        |
| Inline form in sidebar | Expandable form in sidebar/list panel                                  |          |
| Dedicated page         | Navigate to /app/lists/new                                             |          |

**User's choice:** Dialog/modal
**Notes:** None

| Option                      | Description                                            | Selected |
| --------------------------- | ------------------------------------------------------ | -------- |
| Preset palette (6-8 colors) | Fixed set of curated colors, Todoist/Google Keep style | ✓        |
| Full color picker           | Any color, more flexibility                            |          |

**User's choice:** Preset palette (6-8 colors)
**Notes:** None

| Option                     | Description                      | Selected |
| -------------------------- | -------------------------------- | -------- |
| Sidebar section            | Lists below catalog type tree    |          |
| Dedicated /app/lists page  | Separate page for all lists      | ✓        |
| Both — sidebar + full page | Sidebar shortcuts plus full page |          |

**User's choice:** Dedicated /app/lists page
**Notes:** None

| Option         | Description                      | Selected |
| -------------- | -------------------------------- | -------- |
| Confirm dialog | Standard 'Are you sure?' modal   | ✓        |
| Undo toast     | Immediate delete with undo toast |          |

**User's choice:** Confirm dialog
**Notes:** None

---

## Adding Items to Lists

| Option                 | Description                              | Selected |
| ---------------------- | ---------------------------------------- | -------- |
| Button on each card    | 'Add to list' button per CatalogItemCard |          |
| Select mode + bulk add | Check multiple items, then add to list   | ✓        |
| Both — single + bulk   | Button + selection mode                  |          |

**User's choice:** Select mode + bulk add
**Notes:** None

| Option                   | Description                                  | Selected |
| ------------------------ | -------------------------------------------- | -------- |
| Dropdown/popover         | Small popover with list names and color dots |          |
| Dialog with list details | Modal with names, colors, item counts        |          |
| You decide               | Claude picks                                 | ✓        |

**User's choice:** You decide (Claude's discretion)
**Notes:** Guests have 1 list so this is mainly for future authed users

| Option                              | Description                              | Selected |
| ----------------------------------- | ---------------------------------------- | -------- |
| Search/filter overlay               | Searchable overlay showing catalog items |          |
| Navigate to catalog with 'add mode' | Special catalog mode for adding          |          |
| Inline catalog browser              | Embedded mini catalog browser in drawer  |          |
| Custom approach                     | User's own idea                          | ✓        |

**User's choice:** "Show unowned" button in list detail page. Sidebar category tree filters both owned and unowned items.
**Notes:** List detail page has its own sidebar with the category tree. "Show unowned" reveals catalog items not in the list alongside owned items.

| Option                       | Description                      | Selected |
| ---------------------------- | -------------------------------- | -------- |
| Yes — show indicator on card | Badge/icon on catalog cards      |          |
| No — keep catalog clean      | Catalog view stays pure browsing | ✓        |

**User's choice:** No — keep catalog clean
**Notes:** None

---

## Item Detail Editing

| Option                       | Description                           | Selected |
| ---------------------------- | ------------------------------------- | -------- |
| Inline on the list row       | Dropdowns/controls directly on row    |          |
| Click to expand detail panel | Expand section or side panel on click |          |
| Dialog per item              | Modal with all fields                 |          |
| Custom approach              | User's own idea                       | ✓        |

**User's choice:** Grid of cards — image + name, quantity stepper (- / count / +) on bottom-left corner
**Notes:** Detailed custom layout described by user

| Option                            | Description                         | Selected |
| --------------------------------- | ----------------------------------- | -------- |
| Duplicate button on item          | Each item has a Duplicate action    |          |
| Auto-split when condition differs | Prompt to split on condition change |          |
| Custom approach                   | User's own idea                     | ✓        |

**User's choice:** Multi-select via top-left card checkbox, action taskbar at top with Duplicate action
**Notes:** Same taskbar pattern for duplicate, complete, incomplete, condition, remove

| Option                                               | Description                     | Selected |
| ---------------------------------------------------- | ------------------------------- | -------- |
| Schema values (Mint, Near Mint, Good, Poor, Damaged) | 5 conditions from Convex schema | ✓        |
| Different labels                                     | Custom user-facing labels       |          |

**User's choice:** Schema values
**Notes:** None

| Option                   | Description                    | Selected |
| ------------------------ | ------------------------------ | -------- |
| Checkbox on the row      | Simple toggle checkbox         |          |
| Visual state change      | Muted colors, strikethrough    |          |
| Both — checkbox + visual | Checkbox plus visual treatment |          |
| Custom approach          | Taskbar-based                  | ✓        |

**User's choice:** Complete/Incomplete buttons in the taskbar (same multi-select pattern)
**Notes:** Condition also set via taskbar when items selected

### Additional Questions

| Option                                                 | Description     | Selected |
| ------------------------------------------------------ | --------------- | -------- |
| Duplicate, Complete, Incomplete, Set Condition, Remove | Full action set | ✓        |
| Fewer actions                                          | Simpler set     |          |

**User's choice:** Full set of taskbar actions
**Notes:** None

| Option                         | Description                | Selected |
| ------------------------------ | -------------------------- | -------- |
| Toggle button on page          | Separate toggle            |          |
| Filter in taskbar/toolbar area | Filter controls in toolbar | ✓        |

**User's choice:** Filter in taskbar/toolbar area
**Notes:** None

| Option                        | Description          | Selected |
| ----------------------------- | -------------------- | -------- |
| On lists overview page only   | Progress on overview |          |
| Both overview and detail page | Progress on both     | ✓        |

**User's choice:** Both overview and detail page
**Notes:** None

| Option                     | Description                | Selected |
| -------------------------- | -------------------------- | -------- |
| Yes — owned/total per type | e.g., "A4 Sheets (12/150)" |          |
| Just type names            | No counts                  |          |
| Custom approach            | Toggle-based               | ✓        |

**User's choice:** Add a toggle in the sidebar to show owned/total counts per type
**Notes:** None

---

## localStorage Store Design

| Option                  | Description                                                     | Selected |
| ----------------------- | --------------------------------------------------------------- | -------- |
| Build abstraction now   | Abstract ListStore interface for GuestListStore/ConvexListStore | ✓        |
| Just build localStorage | Concrete store, refactor later                                  |          |

**User's choice:** Build the abstraction now
**Notes:** User requested detailed trade-off analysis before deciding. Analysis provided covering pros/cons/recommendation for all three store questions.

| Option           | Description                                   | Selected |
| ---------------- | --------------------------------------------- | -------- |
| Exact mirror     | Same field names/types as Convex schema       |          |
| Simplified shape | Simpler local structure with migration mapper | ✓        |

**User's choice:** Simplified shape, map on migration
**Notes:** Key insight: Convex uses v.id() references that don't exist in localStorage; natural keys (type+number) are more practical locally

| Option                           | Description                             | Selected |
| -------------------------------- | --------------------------------------- | -------- |
| Svelte 5 runes ($state/$derived) | Native reactivity, fine-grained updates | ✓        |
| Context-based with getter/setter | Matches existing ClerkStore pattern     |          |

**User's choice:** Svelte 5 runes
**Notes:** User requested detailed analysis. Recommendation was runes due to frequent data changes vs ClerkStore's infrequent auth state changes.

| Option                  | Description                | Selected |
| ----------------------- | -------------------------- | -------- |
| No limit                | Unlimited lists for guests |          |
| Soft limit with warning | Warning after N lists      |          |
| Hard limit of 1         | Guests get exactly 1 list  | ✓        |

**User's choice:** Limit to 1 list
**Notes:** Custom answer — not one of the presented options. Clean constraint and sign-up incentive.

| Option               | Description                               | Selected |
| -------------------- | ----------------------------------------- | -------- |
| Show error toast     | Toast explaining storage full/unavailable | ✓        |
| Graceful degradation | In-memory with warning                    |          |

**User's choice:** Show error toast
**Notes:** None

| Option                    | Description                  | Selected |
| ------------------------- | ---------------------------- | -------- |
| Auto-save on every change | Immediate localStorage write | ✓        |
| Explicit save             | Save button for batch writes |          |

**User's choice:** Auto-save on every change
**Notes:** None

| Option            | Description                     | Selected |
| ----------------- | ------------------------------- | -------- |
| Svelte reactivity | $state/$derived handles updates | ✓        |
| Custom event bus  | Store dispatches events         |          |

**User's choice:** Svelte reactivity handles it
**Notes:** None

---

## Claude's Discretion

- List picker UI for authed users with multiple lists
- Exact preset color palette choices
- Taskbar visual design and positioning
- "Show unowned" visual treatment for unowned items

## Deferred Ideas

None — discussion stayed within phase scope
