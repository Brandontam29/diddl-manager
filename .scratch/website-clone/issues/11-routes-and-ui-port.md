# Route map & UI port plan

Type: grilling
Status: closed (2026-08-20)
Blocked by: 05

## Question

(2026-08-20: framework redirected to TanStack Start (Solid) — the route tree below
is TanStack Router file routes; specifics come from issue 05 once issue 16 lands.)

Plan the web route tree and the port of the desktop renderer
(`apps/desktop-app/src/renderer/src/`). Decide:

- Routes: library/catalog browse, lists index, list detail, profile, sign-in/up,
  landing — mapped from the desktop's @solidjs/router pages; which are SSR'd vs
  client-heavy (drag-and-drop list editing).
- Which of `components/ui` and `features/*` port as-is, which need SSR-safe rewrites
  (intersection-observer virtualization of the 2,800-image grid, media queries,
  canvas-confetti, motion animations), and what replaces desktop-only chrome
  (custom taskbars/window controls → normal web header/nav).
- How client state (`createDiddlStore`, selected indices, ui-state) maps to web:
  URL state vs stores.
- Versions and any library substitutions come from "Lock framework versions"
  (issue 05).

Consider a /prototype spike if the grid or list-editing interaction feels uncertain —
that would spawn as a new prototype ticket, not extend this one.

## Answer

**2026-08-20 — resolved** (grilling, two rounds). Facts corrected from the
question: the desktop grid is a 150-at-a-time intersection-observer _limiter_, not a
virtualizer; the `Taskbar` is the selection action bar (stays), not window chrome;
the desktop has no working dark theme (2 tokens in CSS), so `theme` is not ported.

### Route tree (TanStack Router file routes)

| Route                              | Access | SSR          | Notes                                                                                                                                                                                                                                                                                                  |
| ---------------------------------- | ------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                                | public | SSR          | Marketing landing: static hero (name, one-line pitch, strip of `/diddls` images, Sign in / Sign up CTAs), placeholder copy. Signed-in visitors are redirected to `/app`.                                                                                                                               |
| `/sign-in/$`, `/sign-up/$`         | public | SSR shell    | Clerk prebuilt components mounted by `@clerk/clerk-js` (splat required).                                                                                                                                                                                                                               |
| `/app` (`_authed` pathless layout) | authed | `ssr: false` | `beforeLoad` checks the Clerk session; unauthenticated → `redirect` to `/sign-in` with a `redirect` search param.                                                                                                                                                                                      |
| `/app` (index)                     | authed | client       | **Library** — desktop `/`.                                                                                                                                                                                                                                                                             |
| `/app/lists`                       | authed | client       | Sections board (dnd-kit).                                                                                                                                                                                                                                                                              |
| `/app/lists/$listId`               | authed | client       | List detail, filters + Show-all mode.                                                                                                                                                                                                                                                                  |
| `/app/settings`                    | authed | client       | Profile (name/birthdate/description/hobbies; avatar = Clerk, no upload) · Display Preferences (card size only, localStorage) · Account (sign out, Clerk `mountUserProfile`, delete account → soft delete). Updater, Dev/secret-migration, and the never-surfaced desktop `settingsSchema` are dropped. |
| `*`                                | —      | —            | `not-found.tsx` ported as the root `notFoundComponent`.                                                                                                                                                                                                                                                |

**SSR posture**: public routes render on the server; everything under `/app` is
`ssr: false` (loaders still run, on the client, against server functions). Smallest
port — no hydration hazards from dnd-kit, the limiter, `useScreenWidth`, confetti,
motion — and Clerk's session is client-resolved anyway. Revisit per-route only if
Library first paint is slow.

### Data layer

- `/app` layout loader: `getCatalog` (staleTime ∞ — immutable per deploy),
  `getSectionsWithLists`, `getProfile` (lazy-upserts profile + Default Section on
  first entry). Mirrors the desktop's single `diddls` / `listSections` caches; the
  sidebar and AddToList popover need lists everywhere.
- `/app/lists/$listId` loader: `getListItems(listId, filters)` keyed on
  `params + search`.
- Mutations: plain async calls to the server functions, then `router.invalidate()`
  (replaces `@solidjs/router` `action`/`revalidate`). Optimistic drag reorder stays
  in component state.
- Errors: `/app` layout `errorComponent` = card + Retry (`router.invalidate()`);
  server-fn NOT_FOUND (e.g. another user's list id) maps to TanStack `notFound()` so
  it renders the 404, not an error card.

### URL & client state

- Search params kept **verbatim** (`type`, `from`, `to`, `showAll`, `isDamaged`,
  `isIncomplete`, `minCount`, `maxCount`), including the sidebar's slice quirks
  (`100-199` = `from=99&to=199`), typed with `validateSearch` + copied zod schemas.
- Selection (`diddlStore.selectedIds`) ported as-is: module-level store, cleared on
  every location change in the `/app` layout, Taskbar shown when non-empty.
- Settings/UI state: localStorage only (per issue 08) — card size is the sole key.

### Port rules

- **Copy, don't share**: `components/ui`, `features/*`, hooks, libs, fonts, styles
  are copied into `apps/website/src` (same rule as the zod schemas in issue 08).
  Every feature file is rewritten anyway (`@renderer/*` alias, router actions, tRPC →
  server functions); a shared package would mean refactoring the frozen desktop app.
- Kobalte `components/ui` port unchanged; `Image` points at `VITE_IMAGE_BASE_URL`;
  fonts move to `public/fonts`.
- Dropped desktop-only code: `features/updater`, `SecretMigrationButton`,
  `SettingsSectionDev`, `useWindowTracking`, `libs/trpc`, Taskbar **Download
  images** (`fileSystem.downloadImages` — local file export; see Out of scope).
  `canvas-confetti` stays for add-to-list success.
- **Responsive floor = tablet**: sidebar becomes a Kobalte `Sheet` drawer under
  768px (`createIsMobile` already exists), grid relies on flex-wrap (the
  `screenWidth - 256 - 32` inline width is removed). No phone-specific work.
- No prototype ticket: nothing here is a new interaction, only a re-wiring.
