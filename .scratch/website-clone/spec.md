# `apps/website` (`@diddl/website`) — locked implementation spec

Status: **locked 2026-08-21** — the destination of the
[web app clone wayfinder map](map.md). Every section below is the assembled answer
of a closed ticket; the ticket holds the reasoning and the rejected alternatives,
this file holds only what implementation needs. If this file and a ticket disagree,
the ticket wins and this file has a bug.

Vocabulary: root [`CONTEXT.md`](../../CONTEXT.md) (Catalog = global data, Library =
browse page, List Section / Default Section / List Item, User vs Profile).

## 1. What is being built

A multi-user web clone of the Electron desktop app (`apps/desktop-app`), frozen at
today's desktop behavior: browse the global read-only Catalog with filters, organize
Lists into List Sections with drag-and-drop, manage List Items (quantity / damaged /
incomplete), edit a Profile. Anyone can sign up; each User owns their Sections,
Lists, Items and Profile against the shared Catalog.

Not in v1 (see the map's Out of scope): desktop wishlist items, auto-updater,
taskbar image download / file-system import-export, admin or curation UI, catalog
renaming, phone layouts, full marketing site, e2e and component tests.

## 2. Stack (ticket 05, 18, 06)

| Concern      | Choice                                                                                                                                                                                             |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI runtime   | `solid-js ^1.9.15` (Solid 2 + Start 2 migration deferred until Solid 2 is stable; avoid `createResource`, `batch`, `on`, `produce` in new code)                                                    |
| Framework    | `@tanstack/solid-start ^1.168.46`, `@tanstack/solid-router ^1.170.29`, Vite, Tailwind 4 via `@tailwindcss/vite`                                                                                    |
| UI libraries | Carried over from desktop unchanged: Kobalte, `@tanstack/solid-form`, `@tanstack/solid-table`, `@dnd-kit/solid`, `lucide-solid`, `solid-icons`, `motion`, `@solid-primitives/*`, `canvas-confetti` |
| Database     | Neon Postgres; runtime `@neondatabase/serverless` (HTTP) + `drizzle-orm/neon-http`; `drizzle-kit` over the direct (unpooled) string for migrations                                                 |
| Auth         | Clerk — client `@clerk/clerk-js` (vanilla), server `@clerk/backend`; no community Solid packages (ADR [`docs/adr/0001-clerk-for-web-auth.md`](../../docs/adr/0001-clerk-for-web-auth.md))          |
| API          | TanStack Start `createServerFn` — no tRPC                                                                                                                                                          |
| Validation   | zod schemas **copied** from `apps/desktop-app/src/shared` into `apps/website/src` and adapted (no shared workspace package)                                                                        |
| Hosting      | Vercel Hobby (free) tier, zero-config Nitro Vercel preset, Git-integration deploys only                                                                                                            |
| Tests        | Vitest                                                                                                                                                                                             |
| Tooling      | bun 1.3.10 workspaces, oxlint / oxfmt with the root configs, husky + lint-staged (already in place)                                                                                                |

## 3. Database schema (ticket 08)

Drizzle, snake_case columns, `timestamptz`. `updated_at` via `$onUpdate`.

- **`diddls`** (Catalog, global, read-only to users): `id int PK` (no identity —
  ids come from `data/catalog.json`, `id = index + 1`), `name text`, `type`
  (pg enum, the 28 Diddl Types from the shared schema), `image_path text`
  (relative, forward slashes), `image_width int`, `image_height int`.
- **`list_sections`**: `id identity PK`, `user_id text NOT NULL`, `name`,
  `position int`, `is_default bool`, `created_at`, `updated_at`, `deleted_at null`.
  Unique index `(user_id, lower(name)) WHERE deleted_at IS NULL`.
- **`lists`**: `id identity PK`, `user_id text NOT NULL`, `section_id FK →
list_sections`, `name`, `color`, `position int`, timestamps, `deleted_at`.
  List names are not unique.
- **`list_items`**: `id identity PK`, `user_id text NOT NULL`, `list_id FK → lists
ON DELETE CASCADE`, `diddl_id FK → diddls`, `quantity int`, `is_damaged bool`,
  `is_incomplete bool`. Hard-deleted; duplicates of the same diddl in one list are
  allowed (desktop migration 004 parity).
- **`profiles`**: `user_id text PK` (Clerk user id), `name`, `birthdate`,
  `description`, `hobbies`, timestamps, `deleted_at`. **No picture column** — the
  avatar is Clerk's `imageUrl`.

Rules: `user_id` is denormalized onto every user-owned table so authorization is
always `WHERE user_id = ?`; account deletion soft-deletes the user's rows (sets
`deleted_at`), nothing cascades from Clerk; no settings table — card size and other
UI state are `localStorage` only.

## 4. Auth (ticket 06, ADR 0001)

- **Client**: a thin hand-rolled Solid provider loads `@clerk/clerk-js` with
  `VITE_CLERK_PUBLISHABLE_KEY` and exposes the Clerk instance + a `user` signal;
  `/sign-in/$` and `/sign-up/$` mount Clerk's prebuilt components
  (`mountSignIn` / `mountSignUp`); settings mounts `mountUserProfile`.
- **Server**: one middleware used by every server function — `@clerk/backend`
  `createClerkClient({ secretKey }).authenticateRequest(request)` reading the
  forwarded `__session` cookie; it puts `userId` on context and throws an
  UNAUTHORIZED error when there is no session.
- **Flows**: email + password and Google. Dev uses Clerk's development instance and
  its shared Google OAuth; production uses a Clerk production instance with a
  hand-provisioned Google OAuth client.
- **Identity**: no local users table, no webhooks. The `profiles` row and the
  Default Section are lazy-upserted on the first authenticated `getProfile`.
- **Route protection**: `/`, `/sign-in/*`, `/sign-up/*` public; everything under
  `/app` requires a session (`beforeLoad` redirect), and every server function
  rejects unauthenticated calls independently.
- **Account deletion**: soft delete of the user's rows, then Clerk user deletion
  from the client.

## 5. Server-function API (ticket 09, 15)

All in `apps/website/src/server/`. Each handler is a **plain function
`(db, userId, input)`** exported from a module; the `createServerFn` wrapper (auth
middleware + zod validator) is a thin shell around it. Reads are `GET` (cacheable),
mutations `POST`. Ownership failures and missing rows throw a NOT_FOUND-style error.

| Group    | Functions                                                                                                                                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Catalog  | `getCatalog` — full Catalog (3,913 rows, no pagination), long immutable cache headers                                                                                                                                                             |
| Sections | `getSectionsWithLists` (nested `ListSectionWithLists` shape, one round-trip), `createSection`, `renameSection`, `deleteSection`, `reorderSections`                                                                                                |
| Lists    | `createList`, `deleteList`, `renameList`, `updateListColor`, `reorderLists` (including cross-section moves)                                                                                                                                       |
| Items    | `getListItems(listId, filters?)` (type, damaged, incomplete, min/max quantity), `addListItems` (batch), `removeListItems` (batch, scoped by listId), `duplicateListItem` (copy, quantity 1), `updateListItems` (batch, incl. `addQuantity` delta) |
| Profile  | `getProfile` (lazy-upserts profile + Default Section), `updateProfile`                                                                                                                                                                            |

Dropped from the desktop: `diddl.fixImages`, `profile.updatePicture`, all
updater / file-system / window procedures.

Client data layer: TanStack Router loaders + `router.invalidate()` after mutations;
no solid-query. Optimistic drag-and-drop reorder stays in component state.

## 6. Routes and UI port (ticket 11)

TanStack Router file routes under `apps/website/src/routes/`:

| Route                      | Access | SSR          | Content                                                                                                                                                                                 |
| -------------------------- | ------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                        | public | SSR          | Static landing hero: name, one-line pitch, strip of `/diddls` images, Sign in / Sign up. Signed-in visitors redirect to `/app`.                                                         |
| `/sign-in/$`, `/sign-up/$` | public | SSR shell    | Clerk prebuilt components (splat required)                                                                                                                                              |
| `_authed` layout → `/app`  | authed | `ssr: false` | `beforeLoad`: no session → `redirect('/sign-in', { search: { redirect } })`. Loader: `getCatalog` (staleTime ∞), `getSectionsWithLists`, `getProfile`. `errorComponent` = card + Retry. |
| `/app`                     | authed | client       | **Library** (desktop `/`)                                                                                                                                                               |
| `/app/lists`               | authed | client       | Sections board (dnd-kit)                                                                                                                                                                |
| `/app/lists/$listId`       | authed | client       | List detail; loader `getListItems(listId, search)`; filters + Show-all mode; NOT_FOUND → `notFound()`                                                                                   |
| `/app/settings`            | authed | client       | Profile form (avatar = Clerk, no upload) · Display preferences (card size, localStorage) · Account (sign out, Clerk user profile, delete account)                                       |
| `*`                        | —      | —            | Root `notFoundComponent` = ported `not-found.tsx`                                                                                                                                       |

Search params kept verbatim from the desktop and typed with `validateSearch` + the
copied zod schemas: `type`, `from`, `to`, `showAll`, `isDamaged`, `isIncomplete`,
`minCount`, `maxCount` (sidebar slice quirk `100-199` = `from=99&to=199` preserved).

Port rules:

- **Copy, don't share**: `components/ui`, `features/*`, hooks, libs, fonts, styles
  are copied from `apps/desktop-app/src/renderer/src` into `apps/website/src`;
  `@renderer/*` alias → `@/*`; `@solidjs/router` actions → server-function calls +
  `router.invalidate()`; tRPC client removed.
- Kept: selection store (`selectedIds`, module-level, cleared on every location
  change), Taskbar (selection action bar, minus **Download images**),
  150-at-a-time intersection-observer grid limiter, `canvas-confetti` on
  add-to-list, `Image` component pointed at `VITE_IMAGE_BASE_URL`, fonts under
  `public/fonts`.
- Dropped: `features/updater`, `SecretMigrationButton`, `SettingsSectionDev`,
  `useWindowTracking`, `useScreenWidth` inline width math, `libs/trpc`, the
  never-surfaced `settingsSchema`, `theme` (desktop has no working dark theme).
- Responsive floor = tablet: sidebar becomes a Kobalte `Sheet` under 768px
  (`createIsMobile`), grid uses flex-wrap.

## 7. Catalog images and seeding (tickets 07, 10)

- Images: `resources/diddl-images.zip` unzipped **once** into
  `apps/website/public/diddls/` preserving subdirectories, committed to git
  (~98MB). Served as originals off Vercel's CDN; `VITE_IMAGE_BASE_URL=/diddls`;
  the DB stores relative paths so a move to Vercel Blob is config-only.
- `apps/website/scripts/clean-catalog.ts` (repeatable): reads
  `apps/desktop-app/src/main/diddl/diddls.json` (untouched) + the unzipped images,
  writes `apps/website/data/catalog.json`. Rules: strip `.jpg`; `_`/`-` runs →
  spaces; collapse whitespace; capitalize first letter; forward-slash paths and
  verify each file exists; backfill missing dimensions from the image; keep
  duplicate names and `type` as-is. **Array order preserved — `id = index + 1`,
  append-only forever** (edit in place, never reorder or remove).
- `apps/website/scripts/load-catalog.ts` (re-runnable): bun script over
  `DATABASE_URL_UNPOOLED`, upserts `diddls` with `ON CONFLICT (id) DO UPDATE`.
- `apps/website/data/catalog.json` is added to `.oxlintrc.json` ignores.

## 8. Personal data migration runbook (ticket 12)

One-off, developer-run; no in-app import. Script
`apps/website/scripts/import-desktop.ts --db <path> --user <clerk_user_id>
[--dry-run]`, reads SQLite read-only via `bun:sqlite`, writes through Drizzle in
**one transaction** against `DATABASE_URL_UNPOOLED`.

1. **Extract (user's PC)**: close the desktop app, copy
   `C:\Users\<name>\AppData\Roaming\diddl-manager\db.sqlite3`, send it to the dev.
   `*.sqlite3` is gitignored under `apps/website`.
2. **Sign up**: the user creates their Clerk account and signs in once (creates
   profile + Default Section). Dev reads the Clerk user id from the dashboard.
3. **Import**, after the Catalog is loaded. Preflight: target account has no lists
   and no non-default sections, else abort. Catalog guard: every referenced
   `diddl_id` must have the same normalized `imagePath` (strip `app://diddl-images/`,
   `\` → `/`) in `catalog.json`, else abort. Desktop ids map verbatim
   (`id = index + 1`, verified 3,913/3,913).
   - Live rows only: soft-deleted sections/lists and the items of deleted lists are
     skipped.
   - Desktop default section → the user's existing web Default Section (reused);
     other sections inserted with name/position/timestamps.
   - Lists: name/color/position/timestamps, `section_id` remapped; null/deleted/
     missing section → Default Section.
   - Items: `diddl_id`, `quantity`, `is_damaged`, `is_incomplete` copied.
   - Profile: not migrated (re-entered on the web).
   - Every row passes the copied zod schemas; any failure aborts (no partial write).
   - `--dry-run` prints counts and violations without writing.
4. **Cutover**: the user stops using the desktop app; no sync or dual-write.

## 9. Environment, dev workflow, CI, deployment (ticket 14)

**Neon**: one project, three long-lived branches — `main` (prod), `dev` (local dev,
Vercel previews, import dry-runs), `test` (CI + local integration tests). No local
Postgres, no per-developer branches, no Neon↔Vercel integration.

**Env vars** (`apps/website/.env.example` committed; `.env.local` / `.env.test`
gitignored):

| Var                          | Where                 | Purpose                                               |
| ---------------------------- | --------------------- | ----------------------------------------------------- |
| `DATABASE_URL`               | server, Vercel        | pooled string, runtime (`neon-http`)                  |
| `DATABASE_URL_UNPOOLED`      | dev machine / CI only | direct string, drizzle-kit + scripts; never on Vercel |
| `CLERK_SECRET_KEY`           | server, Vercel        | `@clerk/backend`                                      |
| `VITE_CLERK_PUBLISHABLE_KEY` | client                | `@clerk/clerk-js`                                     |
| `VITE_IMAGE_BASE_URL`        | client                | `/diddls`                                             |

**Scripts** — `apps/website/package.json`: `dev`, `build`, `lint` (`oxlint --config
../../.oxlintrc.json src scripts`), `typecheck` (`tsc --noEmit`), `format`,
`db:generate`, `db:migrate` (drizzle-kit, `drizzle.config.ts` reads
`DATABASE_URL_UNPOOLED`), `test:unit` (`vitest run --exclude
'**/*.integration.test.ts'`), `test:integration` (`vitest run --config
vitest.integration.config.ts`), `test` (both), all `passWithNoTests`. Root
`package.json`: add `dev:website`, `build:website`, `lint:website`,
`typecheck:website`, `test:website` (`bun run --filter @diddl/website …`); **remove**
the `*:website-svelte` scripts and the `@diddl/website-svelte` trustedDependencies
entry; swap the `.oxlintrc.json` ignore to `apps/website/data/catalog.json`.

**CI** — new `.github/workflows/ci.yaml`, website-only, `on: pull_request` +
`push: main`, ubuntu, `oven-sh/setup-bun@v2` (1.3.10), `bun install
--frozen-lockfile`, then: `format:check` → `lint:website` → `typecheck:website` →
`db:migrate` against the `test` branch → `test:website` → `build:website`. Secrets:
`TEST_DATABASE_URL`, `TEST_DATABASE_URL_UNPOOLED` (mapped to `DATABASE_URL` /
`DATABASE_URL_UNPOOLED` for the migrate + test steps). No prod secret in GitHub.

**Vercel** — project created by hand, linked to the GitHub repo. Root Directory
`apps/website`; framework auto-detected; Install Command `bun install
--frozen-lockfile`; Build Command = preset default; Ignored Build Step
`git diff --quiet HEAD^ HEAD -- apps/website package.json bun.lock`. Production env
= Neon `main` + Clerk production keys; Preview env = Neon `dev` + Clerk development
keys. Production branch `main`. **Never `vercel deploy` from a machine** (100MB
CLI upload cap vs `public/diddls/`); no `vercel.json`.

**Migrations** — manual from the dev machine before merging the PR that needs them:
`DATABASE_URL_UNPOOLED=<direct string> bun run --filter @diddl/website db:migrate`
(run against `dev`, `test`, then `main`). Schema changes must stay compatible with
the running deploy (expand → deploy → contract). No migration step in the build.

**Logging** — `apps/website/src/server/logger.ts` exporting
`log.info/warn/error(msg, meta?)`, one JSON line to stdout/stderr. No third-party
observability.

## 10. Testing (ticket 15)

- Vitest, `environment: node`, tests colocated as `*.test.ts` under
  `apps/website/src/`; integration tests named `*.integration.test.ts` with
  `test/setup.ts` that throws when `DATABASE_URL` is unset.
- Nothing ported from the desktop's two unit tests; new tests cover web code only.
- **Authorization-scoping integration suite (mandatory)**: for every reading and
  mutating handler over sections / lists / items / profile, user A acting on a row
  owned by user B gets the NOT*FOUND-style error (reads) or affects zero rows
  (writes); plus the lazy-upsert of profile + Default Section on first `getProfile`.
  Runs against the real Neon `test` branch through the plain `(db, userId, input)`
  handlers; each file uses random `test*<uuid>`user ids and deletes its own rows
in`afterAll` (items → lists → sections → profiles). No global truncate.
- One structural test asserting every exported handler takes `userId` second.
- No Playwright, no Solid component tests in v1; Vercel previews are the smoke test.

## 11. Suggested build order

Not a decision — a convenience ordering that respects the dependencies above.

1. Workspace scaffold: `apps/website` with TanStack Start (Solid), Tailwind, root
   scripts, `.env.example`, `ci.yaml`, logger, oxlint/oxfmt wiring.
2. Drizzle schema + first migration; `drizzle.config.ts`; run against `dev`/`test`.
3. Catalog: unzip images into `public/diddls/`, `clean-catalog.ts`,
   `catalog.json`, `load-catalog.ts`; load `dev` and `test`.
4. Clerk: Solid provider, sign-in/up routes, auth middleware, `_authed` layout.
5. Server functions + the scoping integration suite (handlers first, tests with them).
6. Renderer port: `components/ui`, then Library, Lists board, List detail,
   Settings, landing.
7. Vercel project + Neon `main` migration + catalog load; first production deploy.
8. `import-desktop.ts`; run the personal-data runbook with the user.
