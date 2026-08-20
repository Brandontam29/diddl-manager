# Dev workflow, CI, and deployment config

Type: grilling
Status: closed (2026-08-20)
Assignee: BrandonTam29 (tam.brandon29@gmail.com)
Blocked by: 05, 18

## Question

With the framework locked (issue 05), the platform chosen (issue 18), and images in
`public/`, decide the day-to-day mechanics:

- Local dev: env var layout (`DATABASE_URL` pooled + unpooled, Clerk keys,
  `IMAGE_BASE_URL`), whether devs use Neon branch databases or a shared dev branch,
  `.env` conventions.
- Root wiring: `dev:website` / `build:website` / `lint:website` /
  `typecheck:website` scripts in the root package.json, matching the existing
  per-app pattern; oxlint/oxfmt coverage for `apps/website`.
- CI: extend the existing GitHub workflow(s) to lint/typecheck the new app.
- Vercel service config (per issue 18): Git-integration deploys **only** — local
  `vercel deploy` is forbidden (the CLI's 100MB source-upload cap vs the ~98MB
  `public/diddls/`, per issue 07); build command from repo root
  (`bun run --filter website build`), root-directory/ignored-build settings for the
  monorepo, env vars, drizzle-kit migration step (run against the unpooled string —
  when/how: manually, or pre-deploy).
- Logging/observability: what replaces the desktop logging module — platform stdout
  logs likely suffice; decide and record.

## Answer

**2026-08-20 — grilled with the user; every item below is their pick (all took the
recommended option).**

### Local dev

- **Database:** one Neon project; branch `main` = production, a long-lived branch
  `dev` = local development and `import-desktop` dry runs (issue 12). No local
  Postgres. Per-developer branches only if a second dev ever appears.
- **Env vars** (`apps/website/.env.example` committed; `.env.local` gitignored —
  root `.gitignore` already covers `.env*.local`):
  - `DATABASE_URL` — pooled string, runtime via `@neondatabase/serverless` +
    `drizzle-orm/neon-http` (issue 18).
  - `DATABASE_URL_UNPOOLED` — direct string, **drizzle-kit only**; never set on Vercel.
  - `CLERK_SECRET_KEY` — server (`@clerk/backend`, issue 06).
  - `VITE_CLERK_PUBLISHABLE_KEY` — client (Vite prefix exposes it).
  - `VITE_IMAGE_BASE_URL=/diddls` — images served from `public/diddls/` (issue 07).
    Neon-integration names (`POSTGRES_URL…`) were rejected; no Neon↔Vercel integration.

### Root wiring

- Add `dev:website`, `build:website`, `lint:website`, `typecheck:website`,
  `test:website` to the root `package.json`, each `bun run --filter @diddl/website
  <script>`, matching the existing per-app pattern.
- **Remove the stale `*:website-svelte` scripts** and the `@diddl/website-svelte`
  `trustedDependencies` entry — that workspace no longer exists. Drop the
  `apps/website-svelte/scripts/catalog.json` ignore in `.oxlintrc.json` and add
  `apps/website/data/catalog.json` (issue 10) in its place.
- `apps/website` scripts mirror the desktop app: `lint` = `oxlint --config
../../.oxlintrc.json src scripts`, `typecheck` = `tsc --noEmit`, `format` = oxfmt
  with the root config. Root `format` / lint-staged already cover the new directory.
  Add `db:generate` / `db:migrate` (`drizzle-kit generate|migrate`, reading
  `DATABASE_URL_UNPOOLED` from `drizzle.config.ts`).

### CI

- Today there is **no** lint/typecheck CI — only the tag-triggered Windows release
  workflow — so this is a new file, not an extension.
- New `.github/workflows/ci.yaml`: `on: pull_request` + `push: branches: [main]`;
  ubuntu; `oven-sh/setup-bun@v2` (1.3.10, same as release.yaml);
  `bun install --frozen-lockfile`; then `format:check`, `lint:website`,
  `typecheck:website`, `build:website`. **Website-only** — the other workspaces are
  not gated (explicitly chosen over a monorepo-wide run). Whether tests join this
  workflow is "Testing strategy" (issue 15)'s call.

### Vercel project

- Created by hand via the dashboard, linked to the GitHub repo. **Git-integration
  deploys only**; `vercel deploy` from a machine is forbidden (100MB source-upload
  cap vs `public/diddls/`, issue 07).
- **Root Directory = `apps/website`**; framework preset auto-detected (TanStack
  Start → Nitro Vercel preset, issue 16); Install Command
  `bun install --frozen-lockfile` (Vercel runs it from the repo root because the
  lockfile is there); Build Command left at the preset default.
- **Ignored Build Step:** `git diff --quiet HEAD^ HEAD -- apps/website package.json
bun.lock` — exit 0 skips desktop-only commits. Saves Hobby build minutes.
- **Environments:** Production = Neon `main` + Clerk production-instance keys.
  Preview = Neon `dev` + Clerk development-instance keys — identical to
  `.env.local`, so previews are real smoke tests and can never touch prod data.
  Ephemeral Neon branches per preview were rejected.
- Production branch = `main`; previews build for every PR/branch (subject to the
  ignored-build step).

### Migrations

- **Manual, from the dev machine**, before merging the PR that needs them:
  `DATABASE_URL_UNPOOLED=<prod direct string> bun run --filter @diddl/website
db:migrate`. Consequence: schema changes must stay backward-compatible with the
  currently running deploy (expand → deploy → contract). No prod DB secret in GitHub;
  no migration step in the Vercel build (it would run on every preview). The same
  command with the `dev` string keeps the `dev` branch current.

### Logging

- Replace the desktop's file-based `logging` module with a thin
  `apps/website/src/server/logger.ts` exporting `log.info/warn/error(msg, meta?)`
  that writes **one JSON line** to stdout/stderr. Vercel captures it as runtime
  logs (Hobby: ~1h retention, no drains — accepted). No pino, no third-party
  observability; swappable later because the call-shape is the only contract.

### Facts later tickets depend on

- Root scripts: `dev:website` / `build:website` / `lint:website` /
  `typecheck:website` / `test:website`.
- Env names as listed above; `.env.example` is the documentation of record.
- CI workflow: `.github/workflows/ci.yaml` (website-only jobs; issue 15 may add a
  test job).
- Vercel Root Directory `apps/website`; Preview env = `dev` branch.
