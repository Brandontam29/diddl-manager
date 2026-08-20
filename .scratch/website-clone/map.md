# Wayfinder map: Diddl Manager web app clone

Label: wayfinder:map
Tickets: `.scratch/website-clone/issues/NN-<slug>.md`

## Destination

A locked spec for `apps/website` (`@diddl/website`): a multi-user web clone of the
desktop app on TanStack Start (Solid) over solid-js 1.9 (Solid 2 migration deferred
to stable), Neon Postgres (Drizzle) + Clerk auth, deployed on Vercel free tier.
The map is done when every implementation-blocking decision is made — implementation
then proceeds as ordinary dev work (likely as openspec changes) without further
planning.

## Notes

- Domain: **diddl** = a specific card/paper collectible. Global read-only **catalog**
  (~2,800 diddls: name, one of 28 types, image) ships today as
  `apps/desktop-app/src/main/diddl/diddls.json` + `resources/diddl-images.zip` (~89MB).
  Users organize **lists** (colored, ordered, soft-deleted) into **sections**;
  a **list item** = a diddl in a list with quantity / isDamaged / isIncomplete.
  Plus a per-user **profile** page. Reference models: `apps/desktop-app/src/shared/`.
- Desktop stack (the source to clone): Electron + SolidJS 1, Kobalte, Tailwind 4,
  TanStack solid-form/solid-table, dnd-kit/solid, Kysely over SQLite, tRPC 10 over IPC.
- Skills every session should consult: /grilling and /domain-modeling for grilling
  tickets; /research for research tickets.
- Settled during charting (constraints, not tickets):
  - Multi-user: anyone signs up; each account owns its lists/sections/items/profile
    against the shared read-only catalog.
  - Scope frozen at today's desktop behavior — core parity (catalog browse + filters,
    sections/lists/items, profile). Desktop wishlist items excluded (see Out of scope).
  - ORM: Drizzle. API: the framework's native server functions, no tRPC.
  - UI: port the existing renderer components/features (same libraries where
    compatible), adapted to web routing/SSR.
  - Auth: **Clerk** (replaced Neon Auth 2026-08-20; design locked same day — see
    "Auth architecture" and ADR 0001), email + Google, all users equal; catalog
    curation stays a seed-script concern.
  - Framework: **TanStack Start (Solid) on solid-js 1.9 stable** (locked
    2026-08-20 — Solid 2 is RC-only and the UI ecosystem requires Solid 1; the
    Solid 2 + Start 2 migration is deferred until Solid 2 stable).
  - Deploy: **Vercel free (Hobby) tier** (locked 2026-08-20; Cloudflare explicitly
    ruled out; Neon via `@neondatabase/serverless` + `drizzle-orm/neon-http`).
    Catalog seeded from `diddls.json`; images as originals, hosting under research.
  - Account deletion: soft delete (no FK cascade) — feeds the Postgres data model.
  - Vocabulary lives in the root `CONTEXT.md` (Catalog = global data,
    Library = browse page).
  - New workspace: `apps/website`, package `@diddl/website`.

## Decisions so far

<!-- one line per closed ticket: gist + link -->

- [Railway deployment for SolidStart + Neon](issues/03-railway-deploy.md) — Nitro
  `node-server` preset as a plain Node process; build from repo root with
  `bun run --filter website build`; Neon over pooled TCP via
  `drizzle-orm/node-postgres` (unpooled string for migrations); no volume needed.
- [SolidStart v2 & SolidJS v2 status and library compatibility](issues/01-solid-v2-landscape.md)
  — SolidStart 2 is stable but built on Solid **1**; SolidJS 2 is RC-only and no
  Start supports it yet, so the realistic stack is solid-js 1.9 + Start 2 (the exact
  lock is the "Lock framework versions" decision).
- [Neon Auth outside React](issues/02-neon-auth-outside-react.md) — Neon Auth is now
  Managed Better Auth (Stack Auth version is legacy/closed): framework-agnostic
  vanilla SDK + REST + JWKS; app tables FK straight to `neon_auth."user"(id)` with no
  sync lag; only the prebuilt UI is React-locked, so Solid forms are hand-written.
- [Image hosting options for the catalog](issues/04-image-hosting-options.md) —
  ranked: R2 + custom domain ($0/mo, zero egress) > `public/` + Railway CDN > Bunny >
  S3 > Railway volume; fold a one-time sharp/WebP + 320px-thumbnail pass into seeding.

- [TanStack Start (Solid) + SolidJS v2 viability](issues/16-tanstack-start-solid2.md)
  — buildable today on RC bits (solid-start/solid-router 2.0.0-rc.1 peer on Solid 2,
  officially supported), but the UI ecosystem (Kobalte/dnd-kit/lucide/primitives,
  and Form/Table via prerelease semver) still requires Solid 1; both concession
  paths documented; Railway and Vercel first-class either way.
- [Clerk in a Solid / TanStack Start app](issues/17-clerk-in-solid.md) — no official
  Solid SDK: vanilla `@clerk/clerk-js` in a thin Solid provider + `@clerk/backend`
  `authenticateRequest()` middleware; skip users table/webhooks, scope by `user_id
text` + lazy-upsert profiles; dev Google OAuth needs no provisioning; free to 50k
  MRU.

- [Lock framework versions](issues/05-lock-framework-versions.md) — (final, after
  one reversal) `solid-js ^1.9.15` + `@tanstack/solid-start ^1.168.46` +
  `@tanstack/solid-router ^1.170.29`; full desktop UI stack carries over; Solid 2 +
  Start 2 migration deferred to Solid 2 stable.
- [Auth architecture](issues/06-auth-architecture.md) — (final, after one reversal;
  ADR 0001) Clerk via vanilla `@clerk/clerk-js` in a thin Solid provider +
  `@clerk/backend` `authenticateRequest()` middleware; no users table/webhooks,
  `user_id text` scoping + lazy-upserted profiles; soft-delete accounts.
- [Choose deployment platform](issues/18-choose-deployment-platform.md) — Vercel
  free (Hobby) tier via the zero-config Nitro preset; Neon over
  `@neondatabase/serverless` HTTP + `drizzle-orm/neon-http` (unpooled TCP string
  kept for drizzle-kit migrations).

- [Image hosting on Vercel free tier](issues/19-vercel-image-hosting.md) — ranked:
  commit images to `public/diddls/` + Vercel CDN (`IMAGE_BASE_URL=/diddls`; the
  100MB cap is CLI-upload-only, plain `<img>` skips the optimization quota) >
  Vercel Blob; Supabase/B2 disqualified as Cloudflare-backed, AWS free tier
  expires, Bunny not free.

- [Postgres data model](issues/08-postgres-data-model.md) — five tables (`diddls`
  global with stable int ids; `list_sections`/`lists`/`list_items`/`profiles`
  scoped by denormalized `user_id text`); parity kept (duplicate items allowed,
  mixed soft/hard deletes, per-user active-row section-name uniqueness); profile
  picture = Clerk avatar (no blob storage); settings/UI state = localStorage;
  zod schemas copied, not shared.
- [Server-function API surface](issues/09-server-function-api.md) — 16
  `createServerFn`s behind a Clerk `ctx.userId` middleware (catalog; nested
  `getSectionsWithLists`; section/list CRUD + reorders; batch item ops; profile with
  lazy-upsert); loaders + `router.invalidate()`, no solid-query; thrown-error
  convention (desktop never actually used neverthrow); drops `fixImages` and
  `updatePicture`.
- [Catalog seeding pipeline](issues/10-catalog-seeding.md) — clean → load:
  a repeatable clean script turns the desktop's `diddls.json` (3,913 entries, no
  ids) into `apps/website/data/catalog.json` (mechanical name cleanup, dims
  backfilled, order preserved); load upserts by ordinal id (`index + 1`,
  append-only contract); images unzipped once into `public/diddls/`.
- [Choose image hosting](issues/07-choose-image-hosting.md) — (final, third
  resolution; ticket holds the two superseded answers) images committed to
  `apps/website/public/diddls/`, originals off Vercel's CDN,
  `IMAGE_BASE_URL=/diddls`; deploys must go through Git integration (CLI upload cap);
  Blob/paid storage remains a config-only escape hatch.

## Not yet specified

(Empty — all former fog has graduated: dev workflow/CI/logging into
"Dev workflow, CI, and deployment config" (issue 14), testing into
"Testing strategy" (issue 15), and desktop↔web code sharing lives inside
"Postgres data model" (issue 08)'s question.)

## Out of scope

- Desktop wishlist items in `notes.md` / `tasks.md` (list rename/duplication, show
  unowned, extra list-view filtering, duplicate-sheet-with-different-status) — scope
  frozen at today's behavior.
- Desktop-only concerns: auto-updater, taskbar, local file-system import/export.
- In-app admin role or catalog-curation UI.
- Editorial renaming of the catalog's cryptic names (e.g. `Msk5`) — a 3,913-item
  curation effort, human or AI-assisted; ruled out during
  [Catalog seeding pipeline](issues/10-catalog-seeding.md). The append-only id
  contract lets it land later as a plain catalog update.
- Retiring or changing the desktop app itself.
