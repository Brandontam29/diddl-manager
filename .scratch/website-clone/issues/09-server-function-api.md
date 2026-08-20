# Server-function API surface

Type: grilling
Status: resolved
Blocked by: 08

## Question

(2026-08-20: framework redirected to TanStack Start — read "server function" below
as TanStack Start's `createServerFn` equivalent; details from issue 16 via issue 05.)

Define the server-function surface that replaces the desktop's tRPC
routers (`apps/desktop-app/src/main/{diddl,list,profile}/router.ts`). Decide:

- The `query`/`action` inventory: catalog fetch + filters, section/list CRUD +
  reorder, list-item add/update/remove, profile read/update — mapped one-to-one from
  tRPC procedures, minus desktop-only ones (updater, file-system, taskbars).
- Validation (reuse the zod schemas) and the authorization wrapper: every mutation
  scoped to the session user from "Auth architecture" (issue 06).
- Caching/revalidation strategy with Solid router preloading (single-flight
  mutations, revalidate keys).
- Error convention: the desktop uses neverthrow Results — keep, or use thrown
  errors + error boundaries as is idiomatic in SolidStart.

## Answer

**2026-08-20 — resolved.** Findings that corrected the question: the desktop routers
do NOT use neverthrow (it appears only in two desktop-only file-system utils) — they
throw `TRPCError` — so thrown errors + error boundaries is parity, not a deviation.
Two procedures drop on web: `diddl.fixImages` (local-filesystem repair) and
`profile.updatePicture` (superseded by the Clerk avatar).

The surface — TanStack Start `createServerFn`, a Clerk auth middleware supplying
`ctx.userId` (via `@clerk/backend` `authenticateRequest()` per "Auth architecture"),
zod validators from the copied shared schemas, every statement scoped by `user_id`:

- Catalog: `getCatalog` — full catalog from Neon (~2,800 rows, no pagination,
  parity), long/immutable cache headers; the DB stays the single source of truth
  (list items FK it), no static-JSON second copy.
- Sections: `getSectionsWithLists` (single nested query returning the existing
  `ListSectionWithLists` shape — deliberate shape change from the desktop's two
  separate queries, one round-trip for the sidebar), `createSection`,
  `renameSection`, `deleteSection`, `reorderSections`.
- Lists: `createList`, `deleteList`, `renameList`, `updateListColor`,
  `reorderLists` (incl. cross-section moves).
- List items: `getListItems(listId, filters?)` — joined + filterable (type,
  damaged, incomplete, min/max quantity) as today; `addListItems` (batch),
  `removeListItems` (batch, scoped by listId), `duplicateListItem` (copy with
  quantity 1), `updateListItems` (batch action incl. `addQuantity` delta).
- Profile: `getProfile` (lazy-upserts the profile row and the per-user Default
  Section on first authenticated call), `updateProfile`.

Client data layer: **TanStack Router loaders + `router.invalidate()`** — no
solid-query in v1; optimistic drag-and-drop reorder stays in local component state
as on desktop. Queries use GET server functions (cacheable), mutations POST.
Ownership failures and missing rows surface as NOT_FOUND-style thrown errors caught
by route error boundaries.
