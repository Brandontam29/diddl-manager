# Feature Landscape

**Domain:** Collectible catalog browser + personal collection list manager (Diddl items)
**Researched:** 2026-04-02
**Reference apps:** Discogs (vinyl), TCGPlayer (cards), MyFigureCollection (figures), Panini Collectors (sticker albums), Coleka (general collectibles), Classifier

---

## Table Stakes

Features users expect. Missing = product feels incomplete or users leave.

| Feature                               | Why Expected                                                                                               | Complexity | Notes                                                                               |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------- |
| Catalog browsing with images          | Core purpose — collectors browse visually, not by ID number alone                                          | Medium     | ~10k items need chunking; sidebar tree (type → range) is established approach       |
| Add item to a list from catalog view  | Closest analog: "Add to Collection" on Discogs/TCGPlayer — this is the primary action                      | Low        | Must be one-click or two-tap, not a modal workflow                                  |
| Multiple lists per user               | Collectors segment: "Owned", "Wishlist", "For Trade", "Duplicate" — expect N lists                         | Low        | Discogs allows unlimited custom folders; single-list apps feel limiting             |
| List rename and color indicator       | Lists need visual identity so users can distinguish them at a glance                                       | Low        | Color picker or palette selector sufficient; no complex labeling needed             |
| Per-item condition tagging            | Collectors grade condition (Mint, Near Mint, Good, Poor etc.) — expected from day one                      | Low        | Dropdown per list-item entry; Discogs, TCGPlayer both treat this as non-optional    |
| Per-item quantity / count             | Collectors accumulate duplicates, gifts, lots — tracking count is expected                                 | Low        | Integer field on list-item; increment/decrement UI pattern preferred over raw input |
| Mark item complete / incomplete       | Completion status (have vs missing) is the defining UX of checklist-style apps (Panini Collectors, Coleka) | Low        | Boolean flag; drives "missing items" view                                           |
| Completion percentage per list        | "You have 63 of 100 A4 items" — every comparable app (EchoMTG, Coleka, Classifier) shows this prominently  | Low        | Derived from complete/incomplete flags; no extra storage needed                     |
| Remove item from list                 | Obvious inverse of add — must exist                                                                        | Low        | Soft delete confirmation for destructive action                                     |
| Guest mode with full trial            | Lowers signup barrier; users who try before committing convert better                                      | Medium     | localStorage implementation; data migrates on signup                                |
| Clerk authentication (login / signup) | Persistent data across devices requires auth                                                               | Low        | Already established in stack                                                        |
| Data migration from guest to authed   | Without this, guest trial value is destroyed at signup                                                     | Medium     | One-time migration; map localStorage list structure to Convex schema                |
| Catalog images displayed clearly      | Visual recognition is how collectors identify items — text-only catalogs fail                              | Low        | Images from Convex storage; lazy-load for performance                               |
| Sidebar navigation by type + range    | 10k items need chunking; type-first is the collector mental model                                          | Medium     | Nested tree: DiddlType → number ranges of 100                                       |

---

## Differentiators

Features that set the product apart. Not expected by default, but valued when present.

| Feature                                         | Value Proposition                                                                                                       | Complexity        | Notes                                                                                                           |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------- |
| Duplicate a list item to tag differently        | Same catalog item, two physical copies in different condition — e.g., one Mint in display, one Good in binder           | Low               | Clone list-item row with independent condition/count/complete flags; Discogs doesn't natively support this well |
| Add items to list from within list detail view  | Collectors want to stay in list context ("I'm building my A4 set") and pull items in, not navigate back to catalog      | Medium            | Requires a search/browse picker inside list detail; friction-reducing pattern from TCGPlayer deck builder       |
| "Missing items" filtered view per list          | Show only incomplete items across a type — "what do I still need?" is the most common question after setup              | Low               | Filter on complete === false; prominently surfaced reduces cognitive load                                       |
| User profile page (name, bio, hobbies, picture) | Personal identity for the collector; community foundation even without social features                                  | Low               | Standard profile CRUD; Clerk provides identity layer                                                            |
| Per-list deletion with confirmation             | Obvious, but many apps skip the confirmation and lose trust with destructive accidents                                  | Low               | Modal confirmation with list name shown                                                                         |
| Multi-image support (schema-ready)              | Future-proofing: stickers/figures often have front/back/variant images; schema ready from day one avoids migration pain | Low (schema only) | No UI needed in v1, just schema flexibility                                                                     |
| Admin: bulk CSV/JSON import                     | Catalog of 10k items cannot be entered manually — bulk import is the only viable admin workflow                         | High              | Parse, validate, deduplicate, insert; image association is the hard part                                        |
| Admin: image management per item                | Managing 10k images individually requires a thoughtful UI — upload, preview, reassign                                   | High              | Convex file storage + admin UI; most complex admin feature                                                      |
| Admin: DiddlType management                     | Types define the sidebar tree; adding/editing types must not require code changes                                       | Low               | Simple CRUD for the type taxonomy                                                                               |

---

## Anti-Features

Features to explicitly NOT build in v1 — they add scope without proportional value for this use case.

| Anti-Feature                                          | Why Avoid                                                                                                  | What to Do Instead                                                                  |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Marketplace / trading                                 | Diddl collectibles don't have an active secondary market in app form; adds auth, escrow, trust complexity  | Stay personal collection tracker; note items as duplicates for future trade context |
| Social features (sharing lists, following collectors) | Out of scope per PROJECT.md; adds privacy, moderation, and feed complexity                                 | Profiles are personal identity only; lists are private by default                   |
| Real-time price tracking / valuation                  | No market data source exists for Diddl; this is a niche collectible, not TCG cards                         | Skip entirely; misleading to show valuations without data                           |
| Barcode / image scanning to add items                 | Diddl items have no standardized barcode system; OCR/AI recognition is not reliable for stickers/pads      | Manual catalog browse + search is correct interaction model                         |
| Global search across all types simultaneously         | Out of scope per PROJECT.md for v1; adds complexity to pagination + indexing                               | Browse by type only; add global search in a later iteration if needed               |
| Wantlist / notification system                        | Diddl items are not actively listed for sale; notification-on-availability (Discogs pattern) has no target | Track "missing" items in lists instead as a personal checklist                      |
| Real-time collaborative list editing                  | Single-user tracker; collaboration adds conflict resolution complexity                                     | Single owner per list                                                               |
| Mobile native app                                     | Web-first; native adds build/deploy/update overhead for v1                                                 | Responsive web with good touch targets                                              |
| Public collection profiles                            | Privacy-first for v1; public browsing requires content moderation                                          | Private by default; revisit for v2 if community demand exists                       |
| Complex condition grading rubric UI                   | Discogs-style lengthy grading guide is overkill for non-traded collectibles                                | Simple dropdown (Mint / Near Mint / Good / Poor / Damaged) is sufficient            |

---

## Feature Dependencies

```
Auth (Clerk) → Convex persistence
                  └─ List CRUD
                       ├─ List detail (add/remove items, condition, count, complete)
                       └─ Duplicate list item

Guest mode (localStorage) → Auth → Guest data migration
                                        └─ (requires list + list-item schema match between localStorage and Convex)

Catalog browsing (type + range sidebar)
  └─ Catalog item display (images)
       └─ Add to list from catalog view
            └─ Add to list from within list detail (extends the same add flow)

Completion tracking (complete flag per item)
  └─ Completion percentage per list (derived)
  └─ Missing items filtered view (derived)

Admin: DiddlType management
  └─ Sidebar navigation (sidebar tree reads DiddlTypes)

Admin: Catalog item CRUD
  └─ Admin: Bulk import (CSV/JSON) — import is a shortcut to the same CRUD operations
  └─ Admin: Image management (images attach to catalog items)
```

---

## MVP Recommendation

Prioritize in this order for the first functional release:

1. Convex schema (catalog item, DiddlType, list, list-item, profile) — everything else depends on this
2. Sidebar navigation (type → range tree) + catalog item grid with images — the "browse" half of the core value
3. Auth (Clerk login page) + guest mode (localStorage) — needed to persist anything
4. List CRUD (create, rename, color, delete) — the "collect" half of the core value
5. List detail: add/remove items, condition, count, complete/incomplete — makes lists useful
6. Completion percentage + missing items view — immediate payoff for collectors who add items
7. Guest-to-authed data migration — preserves guest trial investment
8. Duplicate list item — differentiator that addresses a real collector need (multiple copies, different condition)
9. User profile page — personal identity layer
10. Admin: type management + catalog CRUD + bulk import + image management — last because catalog is seeded before launch

Defer to post-v1:

- Add items from within list detail view (ship after catalog → list add is working; same flow, different entry point)
- Global search across types (meaningful once catalog is fully populated and users are power users)
- Multi-image UI (schema is ready; surface when catalog images are more complete)

---

## Sources

- [Discogs: How Does The Collection Feature Work](https://support.discogs.com/hc/en-us/articles/360007331534-How-Does-The-Collection-Feature-Work)
- [Discogs: Customizing Your Collection Notes](https://support.discogs.com/hc/en-us/articles/360007331674-Customizing-Your-Collection-Notes)
- [Discogs: Collection Tool Improvements 2024](https://www.discogs.com/about/updates/collection-tool-foundational-improvements-2024/)
- [Discogs: How Does The Wantlist Feature Work](https://support.discogs.com/hc/en-us/articles/360007331594-How-Does-The-Wantlist-Feature-Work)
- [Panini Collectors App](https://www.paninigroup.com/en/gb/panini-collectors-app)
- [Coleka: Collection Tracker on Google Play](https://play.google.com/store/apps/details?id=com.xnview.coleka&hl=en_US)
- [iCollect Everything: Best Trading Card Collection Apps 2026](https://www.icollecteverything.com/2026/03/27/best-trading-card-collection-apps/)
- [TCGPlayer Card Conditioning Overview](https://help.tcgplayer.com/hc/en-us/articles/221430307-Card-Conditioning-Overview)
- [Classifier: Collection Tracker](https://impresskit.net/ae731333-f26b-4710-bc6f-328f736415f1)
- [MyFigureList on Google Play](https://play.google.com/store/apps/details?id=com.myfigurelist.app)
