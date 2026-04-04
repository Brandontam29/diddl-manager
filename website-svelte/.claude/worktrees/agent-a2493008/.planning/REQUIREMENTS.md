# Requirements: Diddl Manager

**Defined:** 2026-04-02
**Core Value:** Users can browse the Diddl catalog by type and manage their collection lists — tracking what they have, its condition, and what they're missing.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Schema & Data

- [ ] **DATA-01**: Convex schema defines catalog items with type, name, edition, release date, and storageId for images
- [ ] **DATA-02**: Convex schema defines lists with name, description, color, and ownership
- [ ] **DATA-03**: Convex schema defines list items with condition, quantity, complete flag, and tags
- [ ] **DATA-04**: Convex schema defines user profiles with name, bio, hobbies, and picture
- [ ] **DATA-05**: Convex schema defines DiddlTypes as a managed collection (not hardcoded enum)
- [ ] **DATA-06**: Compound index on catalog items (type, number) for efficient sidebar-range queries
- [ ] **DATA-07**: Schema supports multiple images per catalog item (storageId array, future-ready)

### Catalog Browsing

- [ ] **CATL-01**: User can browse catalog items by type via nested sidebar tree (type → number ranges of 100)
- [ ] **CATL-02**: User can view catalog item cards with images loaded from Convex storage
- [ ] **CATL-03**: Images lazy-load for performance when browsing large sets
- [ ] **CATL-04**: Sidebar shows completion percentage per type/range when user is authenticated

### Collection Lists

- [ ] **LIST-01**: User can create a new list with a name and color indicator
- [ ] **LIST-02**: User can rename a list and change its color
- [ ] **LIST-03**: User can delete a list with confirmation
- [ ] **LIST-04**: User can add a catalog item to a list from the catalog view
- [ ] **LIST-05**: User can remove an item from a list
- [ ] **LIST-06**: User can modify the quantity/count of a list item
- [ ] **LIST-07**: User can tag the condition of a list item (Mint, Near Mint, Good, Poor, Damaged)
- [ ] **LIST-08**: User can mark a list item as complete or incomplete
- [ ] **LIST-09**: User can duplicate a list item to tag it with a different condition
- [ ] **LIST-10**: User can add catalog items from within the list detail page (inline search/browse)
- [ ] **LIST-11**: User can view completion percentage per list
- [ ] **LIST-12**: User can filter to show only missing (incomplete) items in a list

### Authentication & Guest Mode

- [ ] **AUTH-01**: User can sign up and log in via Clerk
- [ ] **AUTH-02**: User can use the app without logging in (guest mode with full trial)
- [x] **AUTH-03**: Guest data is stored in localStorage with the same data model as Convex
- [x] **AUTH-04**: Guest data migrates to Convex on first sign-in (idempotent migration)
- [ ] **AUTH-05**: User session persists across browser refresh

### User Profile

- [ ] **PROF-01**: User can view and edit their profile (name, bio, hobbies)
- [ ] **PROF-02**: User can upload a profile picture

### Admin

- [ ] **ADMN-01**: Admin can create, edit, and delete individual catalog items
- [ ] **ADMN-02**: Admin can bulk import catalog items via CSV or JSON upload
- [ ] **ADMN-03**: Admin can upload and manage product images (attach to catalog items)
- [ ] **ADMN-04**: Admin can add, edit, and remove DiddlTypes
- [ ] **ADMN-05**: Admin role is gated via Clerk metadata

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Search & Discovery

- **SRCH-01**: User can search across all types simultaneously
- **SRCH-02**: User can filter catalog by edition, release date, or name

### Social

- **SOCL-01**: User can share a list via public link
- **SOCL-02**: User can view other collectors' public profiles

### Multi-Image

- **MIMG-01**: User can view multiple images per catalog item (front, back, variants)
- **MIMG-02**: Admin can upload multiple images per catalog item

## Out of Scope

| Feature | Reason |
|---------|--------|
| Marketplace / trading | No active Diddl secondary market; adds escrow/trust complexity |
| Real-time price tracking | No market data source for Diddl collectibles |
| Barcode / image scanning | Diddl items have no standardized barcodes |
| Real-time collaborative list editing | Single-user tracker; collaboration adds conflict resolution |
| Mobile native app | Web-first for v1; responsive web with good touch targets |
| Notification / wantlist system | No active listings to notify about |
| Complex grading rubric | Simple dropdown sufficient for non-traded collectibles |
| Public collection profiles | Privacy-first for v1; revisit if community demand |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| DATA-04 | Phase 1 | Pending |
| DATA-05 | Phase 1 | Pending |
| DATA-06 | Phase 1 | Pending |
| DATA-07 | Phase 1 | Pending |
| CATL-01 | Phase 1 | Pending |
| CATL-02 | Phase 1 | Pending |
| CATL-03 | Phase 1 | Pending |
| CATL-04 | Phase 1 | Pending |
| LIST-01 | Phase 2 | Pending |
| LIST-02 | Phase 2 | Pending |
| LIST-03 | Phase 2 | Pending |
| LIST-04 | Phase 2 | Pending |
| LIST-05 | Phase 2 | Pending |
| LIST-06 | Phase 2 | Pending |
| LIST-07 | Phase 2 | Pending |
| LIST-08 | Phase 2 | Pending |
| LIST-09 | Phase 2 | Pending |
| LIST-10 | Phase 2 | Pending |
| LIST-11 | Phase 2 | Pending |
| LIST-12 | Phase 2 | Pending |
| AUTH-01 | Phase 3 | Pending |
| AUTH-02 | Phase 3 | Pending |
| AUTH-03 | Phase 3 | Complete |
| AUTH-04 | Phase 3 | Complete |
| AUTH-05 | Phase 3 | Pending |
| PROF-01 | Phase 4 | Pending |
| PROF-02 | Phase 4 | Pending |
| ADMN-01 | Phase 5 | Pending |
| ADMN-02 | Phase 5 | Pending |
| ADMN-03 | Phase 5 | Pending |
| ADMN-04 | Phase 5 | Pending |
| ADMN-05 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 35 total
- Mapped to phases: 35
- Unmapped: 0

---
*Requirements defined: 2026-04-02*
*Last updated: 2026-04-02 — traceability populated after roadmap creation*
