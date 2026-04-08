# Diddl Manager

## What This Is

A web application for Diddl collectors to browse a master catalog of ~10,000 Diddl products and manage personal collection lists. Users track what they own, the condition of each item, quantities, and completion status. The app works as a full trial for guests (localStorage), with Clerk auth to persist data to Convex.

## Core Value

Users can browse the Diddl catalog by type and manage their collection lists — tracking what they have, its condition, and what they're missing. Catalog browsing and list management are equally critical; one is useless without the other.

## Requirements

### Validated

- ✓ SvelteKit + Convex + Effect v4 + Clerk stack wired up — existing
- ✓ Authed and private Convex function patterns established — existing
- ✓ ClerkService and ConvexPrivateService Effect layers — existing
- ✓ Svelte 5 runes-based auth state management — existing
- ✓ ESLint + Prettier + svelte-check tooling — existing

### Active

- [ ] Catalog browsing by type with nested sidebar (type → number ranges of 100)
- [ ] Catalog item display with images from Convex storage
- [ ] List CRUD (create, rename, change color indicator, delete)
- [ ] List detail page — add/remove catalog items, modify count, tag condition, mark complete/incomplete
- [ ] Duplicate list item to tag differently
- [ ] Add items to list from catalog view or from within list detail
- [ ] Guest mode with full trial (localStorage), data migrates on signup
- [ ] Clerk authentication with login page
- [ ] User profile page (name, bio, hobbies, picture)
- [ ] Master Admin page — CRUD catalog items, bulk import (CSV/JSON), image management, type management
- [ ] Convex schema for Diddl catalog, lists, list items, profiles (replacing placeholder conferences)
- [ ] Support for multiple images per product in the future (schema ready)

### Out of Scope

- Mobile native app — web-first for v1
- Social features (sharing lists, following collectors) — not in scope
- Marketplace / trading — this is a personal collection tracker
- Real-time collaboration on lists — single-user editing
- Search across all types simultaneously — browse by type only for v1

## Context

- Existing codebase has full stack wired (SvelteKit, Convex, Effect v4, Clerk, Tailwind) but domain logic is placeholder (conferences schema). The infrastructure patterns (authed/private Convex functions, Effect service layers, Clerk integration) are established and reusable.
- Data models exist in `models/` (Zod schemas for Diddl, List, ListItem, Profile) but aren't yet integrated into Convex schema.
- ~10,000 catalog items across 27 DiddlTypes, each with an image. Categories range from 100-300 items.
- Sidebar is a nested tree: type → number ranges (e.g., "A4 1-100", "A4 101-200"). Clicking a range shows those catalog items.
- Guest mode stores lists in localStorage with full functionality; signing up migrates local data to Convex.
- Admin needs: individual CRUD, bulk CSV/JSON import, image upload/management, and DiddlType management.

## Constraints

- **Tech stack**: SvelteKit, Tailwind, Convex, Effect v4, Clerk (already established)
- **Package manager**: Bun
- **Image storage**: Convex file storage for product images
- **Catalog size**: ~10,000 items — pagination by type in groups of 100
- **Image schema**: Currently 1 image per product, schema must be ready for multiple images
- **Svelte**: Modern Svelte 5 patterns, all components with `lang="ts"`
- **Backend**: Effect v4 for all backend code, ConvexService for backend Convex calls
- **Convex functions**: authed setup for client-facing, private setup for backend-only

## Key Decisions

| Decision                               | Rationale                                                                   | Outcome   |
| -------------------------------------- | --------------------------------------------------------------------------- | --------- |
| Convex for database + realtime         | Already integrated, provides reactive queries and serverless functions      | — Pending |
| Clerk for auth                         | Already integrated, handles identity + JWT for Convex                       | — Pending |
| Guest mode with localStorage migration | Full trial lowers barrier to entry, migration preserves work                | — Pending |
| Sidebar as nested type → range tree    | 10k items need chunking; type-first browsing matches collector mental model | — Pending |
| Effect v4 for backend                  | Type-safe error handling, composable services already established           | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):

1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):

1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

_Last updated: 2026-04-02 after initialization_
