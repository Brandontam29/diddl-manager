# Scaffold the apps/website workspace

Type: task
Status: open
Blocked by: — (none; frontier)

## Question

Create `apps/website` (`@diddl/website`) per spec.md §2 and §9: TanStack Start (Solid) on `solid-js ^1.9.15` / `@tanstack/solid-start ^1.168.46` / `@tanstack/solid-router ^1.170.29`, Tailwind 4 via `@tailwindcss/vite`, Vitest (`test`, `test:unit`, `test:integration`, `passWithNoTests`), `lint`/`typecheck`/`format` scripts using the root oxlint/oxfmt configs, `.env.example` with the five env vars, `src/server/logger.ts`, a placeholder `/` route. Root `package.json`: add the five `*:website` scripts, remove the stale `*:website-svelte` scripts and trustedDependencies entry. Add `.github/workflows/ci.yaml` (website-only: format:check → lint → typecheck → unit tests → build; the db:migrate + integration steps are wired in 'Server functions and the scoping suite' once secrets exist). Update `.oxlintrc.json` ignore to `apps/website/data/catalog.json`.

Done when: `bun run dev:website` serves the placeholder, `bun run build:website`, `lint:website`, `typecheck:website`, `test:website` all pass locally, and ci.yaml is green on main.
