# Roadmap: Diddl Manager

## Overview

Starting from an existing SvelteKit + Convex + Effect + Clerk stack with placeholder domain logic, this roadmap delivers a working Diddl catalog browser and personal collection manager in five phases ordered by dependency. Schema and catalog browsing come first because everything else depends on visible data. Guest list mode validates the data model before auth is layered on. Auth and migration follow, then standalone profile, and finally admin tooling to seed and manage the catalog.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Schema + Catalog** - Replace placeholder schema with Diddl domain models and deliver a browsable catalog with images
- [x] **Phase 2: Guest List Mode** - Full list CRUD and list-item management working in localStorage before auth exists (completed 2026-04-03)
- [ ] **Phase 3: Auth + Migration** - Clerk sign-in/sign-up, ConvexListStore backed by authed functions, idempotent guest-to-Convex migration
- [ ] **Phase 4: Profile** - Authenticated user profile page with picture upload
- [ ] **Phase 5: Admin** - Role-gated catalog management: individual CRUD, bulk import, image management, type management

## Phase Details

### Phase 1: Schema + Catalog

**Goal**: Users can browse the full Diddl catalog by type using a nested sidebar, and see each item's image
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, DATA-06, DATA-07, CATL-01, CATL-02, CATL-03, CATL-04
**Success Criteria** (what must be TRUE):

1. User can open a sidebar, expand a DiddlType, and click a number range (e.g., "A4 1-100") to see those catalog items
2. Each catalog item card displays its image loaded from Convex storage
3. Images lazy-load so the page does not block on 100 network requests at once
4. When a user is authenticated, the sidebar shows a completion percentage per type and range
5. Convex schema has compound index on (type, number) so range queries are indexed, not full scans
   **Plans**: 5 plans
   **UI hint**: yes

Plans:

- [ ] 01-01-PLAN.md — shadcn-svelte init (stone theme) + runed install + full domain schema (all 5 tables + compound index)
- [ ] 01-02-PLAN.md — Convex query functions (catalog listByRange, diddlTypes list) + seed private action + internal mutation
- [ ] 01-03-PLAN.md — Seed orchestration: catalog.json number extraction, chunked seeding, protected POST endpoint
- [ ] 01-04-PLAN.md — All 7 catalog UI components (LazyImage, CatalogItemCard, CompletionBadge, sidebar rows, CatalogGrid, CatalogSidebar)
- [ ] 01-05-PLAN.md — Catalog page wiring + human verification checkpoint

### Phase 2: Guest List Mode

**Goal**: Users can create and manage collection lists with full item-level detail — all stored in localStorage without needing an account
**Depends on**: Phase 1
**Requirements**: LIST-01, LIST-02, LIST-03, LIST-04, LIST-05, LIST-06, LIST-07, LIST-08, LIST-09, LIST-10, LIST-11, LIST-12
**Success Criteria** (what must be TRUE):

1. User can create a list with a name and color, rename it, and delete it with a confirmation prompt
2. User can add a catalog item to a list from the catalog view and from within the list detail page
3. User can set the condition (Mint / Near Mint / Good / Poor / Damaged), quantity, and complete flag on each list item, and duplicate an item to track two copies with different conditions
4. User can see a completion percentage for each list and filter the list view to show only incomplete (missing) items
5. All list state survives a full browser refresh when the user is not logged in
   **Plans**: 5 plans
   **UI hint**: yes

Plans:

- [x] 02-01-PLAN.md — Install Phase 2 shadcn primitives for dialogs, selection, toolbars, forms, and toasts
- [x] 02-02-PLAN.md — Build ListStore contracts, rune-backed GuestListStore, shared context, and app-layout wiring
- [x] 02-03-PLAN.md — Lists overview route with reusable create/edit/delete dialogs, color palette, and guest entry hub
- [x] 02-04-PLAN.md — List detail page with sidebar, toolbar, quantity/condition actions, missing filter, and explicit add-from-detail flow
- [ ] 02-05-PLAN.md — Catalog select mode bulk add using the shared guest list flow

### Phase 3: Auth + Migration

**Goal**: Users can sign in with Clerk and have their guest data migrated to Convex automatically, with list behavior identical to guest mode
**Depends on**: Phase 2
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):

1. User can sign up and log in via Clerk; session persists across browser refresh
2. After signing in from guest mode, all lists and list items previously in localStorage appear in the authenticated view without duplicates
3. If the migration network call fails, localStorage is not cleared and retrying succeeds idempotently
4. Unauthenticated users still get full list functionality (guest mode is not broken by auth addition)
   **Plans**: 3 plans
   **UI hint**: yes

Plans:

- [x] 03-01-PLAN.md — Convex backend: schema migrations table, authed list/listItem CRUD, migration action with idempotency
- [x] 03-02-PLAN.md — Landing page, Clerk theming, AppHeader, ShimmerGrid, UpgradePrompt components
- [ ] 03-03-PLAN.md — ConvexListStore, migration orchestrator, reactive store switching, app layout wiring

### Phase 4: Profile

**Goal**: Authenticated users can view and edit a personal profile including a picture
**Depends on**: Phase 3
**Requirements**: PROF-01, PROF-02
**Success Criteria** (what must be TRUE):

1. Authenticated user can view their profile page showing name, bio, and hobbies
2. User can edit name, bio, and hobbies and see changes persist after page refresh
3. User can upload a profile picture and see it displayed on their profile
   **Plans**: TBD
   **UI hint**: yes

### Phase 5: Admin

**Goal**: Admin users can manage the Diddl catalog: create/edit/delete items, bulk import, manage images, and manage DiddlTypes
**Depends on**: Phase 1
**Requirements**: ADMN-01, ADMN-02, ADMN-03, ADMN-04, ADMN-05
**Success Criteria** (what must be TRUE):

1. Admin can create, edit, and delete individual catalog items through a protected admin UI
2. Admin can upload a CSV or JSON file and have its records imported into the catalog in chunks, with visible progress
3. Admin can upload product images and attach them to catalog items
4. Admin can add, rename, and remove DiddlTypes from the managed collection
5. Non-admin authenticated users cannot access admin routes or call admin mutations from the browser
   **Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase               | Plans Complete | Status      | Completed  |
| ------------------- | -------------- | ----------- | ---------- |
| 1. Schema + Catalog | 0/5            | Not started | -          |
| 2. Guest List Mode  | 4/5            | Complete    | 2026-04-03 |
| 3. Auth + Migration | 2/3            | In Progress |            |
| 4. Profile          | 0/?            | Not started | -          |
| 5. Admin            | 0/?            | Not started | -          |
