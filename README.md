# diddl-manager

Bun monorepo for the Diddl Manager projects.

## Workspace layout

- `apps/desktop-app`: Electron + Solid desktop app
- `apps/website-svelte`: SvelteKit web app
- `apps/website-solid-claude`: SolidStart app prototype
- `apps/website-solid-codex`: SolidStart app prototype
- `apps/scrape-diddl`: Bun scraper utilities
- `apps/data-migrations`: Bun data migration utilities

## Install

```bash
bun install
```

## Common commands

```bash
bun run dev:desktop
bun run build:desktop
bun run test:desktop

bun run dev:website-svelte
bun run dev:website-solid-claude
bun run dev:website-solid-codex
```

To run a workspace-local script directly:

```bash
bun run --filter @diddl/desktop-app typecheck
bun run --filter @diddl/website-svelte check
```
